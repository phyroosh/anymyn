const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { ProjectMeta, UploadLedger } = require('./db');

const ROOT_DIR = path.resolve(__dirname, '../..');
const VIDEOS_DIR = path.join(ROOT_DIR, 'videos');
const STUDIO_RENDERS_DIR = path.join(ROOT_DIR, 'studio', 'renders');

// In-memory cache for ffprobe outputs keyed by filepath + mtime
const probeCache = new Map();

function probeVideo(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stats = fs.statSync(filePath);
    const cacheKey = `${filePath}:${stats.mtimeMs}`;
    if (probeCache.has(cacheKey)) {
      return probeCache.get(cacheKey);
    }

    const stdout = execSync(
      `ffprobe -v error -show_format -show_streams -of json "${filePath}"`,
      { encoding: 'utf8', timeout: 5000 }
    );
    const data = JSON.parse(stdout);

    const videoStream = (data.streams || []).find(s => s.codec_type === 'video');
    const audioStream = (data.streams || []).find(s => s.codec_type === 'audio');

    let fps = 30;
    if (videoStream && videoStream.r_frame_rate) {
      const [num, den] = videoStream.r_frame_rate.split('/');
      fps = den ? Math.round(Number(num) / Number(den)) : Number(num);
    }

    const duration = data.format ? parseFloat(data.format.duration || 0) : 0;
    const size = data.format ? parseInt(data.format.size || 0, 10) : stats.size;
    const bitrate = data.format ? parseInt(data.format.bit_rate || 0, 10) : 0;

    const probeResult = {
      width: videoStream ? videoStream.width : 1080,
      height: videoStream ? videoStream.height : 1920,
      fps: fps || 30,
      duration: duration,
      durationFormatted: formatDuration(duration),
      size: size,
      sizeFormatted: formatBytes(size),
      bitrate: bitrate,
      videoCodec: videoStream ? videoStream.codec_name : 'h264',
      audioCodec: audioStream ? audioStream.codec_name : 'aac',
      sampleRate: audioStream ? parseInt(audioStream.sample_rate || 48000, 10) : 48000,
      channels: audioStream ? audioStream.channels : 2
    };

    probeCache.set(cacheKey, probeResult);
    return probeResult;
  } catch (err) {
    console.error(`Error probing ${filePath}:`, err.message);
    return null;
  }
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms}s`;
}

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function cleanTitleFromSlug(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function scanProject(slug) {
  const projectDir = path.join(VIDEOS_DIR, slug);
  if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
    return null;
  }

  // Find master render
  const rendersDir = path.join(projectDir, 'renders');
  let masterRenderPath = null;
  let renderStats = null;
  let probe = null;

  if (fs.existsSync(rendersDir)) {
    const files = fs.readdirSync(rendersDir).filter(f => f.endsWith('.mp4'));
    // Look for master or primary mp4
    const masterFile = files.find(f => f.includes('master')) || files[0];
    if (masterFile) {
      masterRenderPath = path.join(rendersDir, masterFile);
      renderStats = fs.statSync(masterRenderPath);
      probe = probeVideo(masterRenderPath);
    }
  }

  // Also check if render is in studio/renders/<slug>_master.mp4
  if (!masterRenderPath) {
    const studioMaster = path.join(STUDIO_RENDERS_DIR, `${slug.replace(/-/g, '_')}_master.mp4`);
    if (fs.existsSync(studioMaster)) {
      masterRenderPath = studioMaster;
      renderStats = fs.statSync(masterRenderPath);
      probe = probeVideo(masterRenderPath);
    }
  }

  // Discover artifacts
  const scriptPath = path.join(projectDir, 'script', 'script.md');
  const elevenlabsScriptPath = path.join(projectDir, 'voiceover', 'elevenlabs_script.txt');
  const voiceoverDirDoc = path.join(projectDir, 'voiceover', 'voiceover_direction.md');
  const sceneNarrationMapPath = path.join(projectDir, 'voiceover', 'scene_narration_map.md');
  const storyboardPath = path.join(projectDir, 'storyboard', 'storyboard.md');
  const retentionMapPath = path.join(projectDir, 'retention_map.md');
  const qcReportPath = path.join(projectDir, 'qc', 'qc_report.md');
  const contactSheetPath = path.join(projectDir, 'qc', 'contact_sheet.png');
  const manifestPath = path.join(projectDir, 'production_manifest.json');
  const calculationsPath = path.join(projectDir, 'research', 'verified_calculations.json');
  const audioDir = path.join(projectDir, 'audio');

  // Audio files discovery
  let voiceoverOriginalPath = null;
  let masterAudioPath = null;
  let soundtrackPath = null;
  let audioStems = [];

  if (fs.existsSync(audioDir)) {
    const audioFiles = fs.readdirSync(audioDir);
    const voOriginal = audioFiles.find(f => f.startsWith('voiceover_elevenlabs_original') || f.includes('voiceover_full'));
    if (voOriginal) voiceoverOriginalPath = path.join(audioDir, voOriginal);

    const mAudio = audioFiles.find(f => f === 'master_audio.mp3');
    if (mAudio) masterAudioPath = path.join(audioDir, mAudio);

    const stAudio = audioFiles.find(f => f === 'soundtrack_master.mp3' || f === 'soundtrack_raw.wav');
    if (stAudio) soundtrackPath = path.join(audioDir, stAudio);

    audioStems = audioFiles.filter(f => f.includes('scene') && f.endsWith('.mp3'));
  }

  // Read manifest if available
  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (_) {}
  }

  // Derive title
  let title = manifest ? manifest.title : null;
  if (!title && fs.existsSync(scriptPath)) {
    try {
      const scriptText = fs.readFileSync(scriptPath, 'utf8');
      const titleMatch = scriptText.match(/##\s*Title:\s*(.+)$/m) ||
                         scriptText.match(/^#\s*ANYMYN Script\s*[—–-]\s*["']?([^"\n\r]+)["']?/im) ||
                         scriptText.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1].replace(/ANYMYN Script\s*[—–-]\s*/i, '').replace(/\(V[0-9.]+\)/, '').replace(/["']/g, '').trim();
      }
    } catch (_) {}
  }
  if (!title || title.includes('Narrative Script') || title.includes('Phonetic Guide')) {
    title = cleanTitleFromSlug(slug);
  }

  // Read script word count & excerpt
  let scriptExcerpt = '';
  let scriptWordCount = 0;
  if (fs.existsSync(scriptPath)) {
    try {
      const text = fs.readFileSync(scriptPath, 'utf8');
      scriptWordCount = text.split(/\s+/).filter(Boolean).length;
      scriptExcerpt = text.slice(0, 300) + '...';
    } catch (_) {}
  }

  // Check upload ledger from DB
  const uploads = UploadLedger.getByProject(slug);
  const latestUpload = uploads.length > 0 ? uploads[0] : null;

  // Load custom project metadata from DB
  const dbMeta = ProjectMeta.get(slug) || {};

  // Determine pipeline status
  let status = 'IN_PRODUCTION';
  if (latestUpload && latestUpload.status === 'success') {
    if (latestUpload.scheduled_publish_time) {
      const pubTime = new Date(latestUpload.scheduled_publish_time).getTime();
      status = pubTime <= Date.now() ? 'PUBLISHED' : 'SCHEDULED';
    } else {
      status = latestUpload.privacy_status === 'public' ? 'PUBLISHED' : 'UPLOADED';
    }
  } else if (dbMeta.scheduled_publish_time) {
    const pubTime = new Date(dbMeta.scheduled_publish_time).getTime();
    status = pubTime <= Date.now() ? 'PUBLISHED' : 'SCHEDULED';
  } else if (masterRenderPath && fs.existsSync(qcReportPath)) {
    status = 'READY_TO_PUBLISH';
  } else if (masterRenderPath) {
    status = 'COMPLETED';
  } else if (voiceoverOriginalPath) {
    status = 'AWAITING_RENDER';
  } else if (fs.existsSync(elevenlabsScriptPath) && !voiceoverOriginalPath) {
    status = 'AWAITING_VOICEOVER'; // Mandatory human gate!
  } else if (fs.existsSync(scriptPath)) {
    status = 'SCRIPT_COMPLETE';
  }

  // Load AI Generated YouTube Metadata if available
  const aiMetadataPath = path.join(projectDir, 'youtube_metadata.json');
  let aiMetadata = null;
  let isMetadataOutdated = false;
  if (fs.existsSync(aiMetadataPath)) {
    try {
      aiMetadata = JSON.parse(fs.readFileSync(aiMetadataPath, 'utf8'));
      if (aiMetadata.generatedAt) {
        const genTime = new Date(aiMetadata.generatedAt).getTime();
        const scriptMtime = fs.existsSync(scriptPath) ? fs.statSync(scriptPath).mtimeMs : 0;
        const renderMtime = renderStats ? renderStats.mtimeMs : 0;
        if (scriptMtime > genTime || renderMtime > genTime) {
          isMetadataOutdated = true;
        }
      }
    } catch (err) {
      console.warn(`[Scanner] Error reading ${aiMetadataPath}:`, err.message);
    }
  }

  // Determine metadata status (approved, user_edited, ai_generated, draft)
  let metadataStatus = 'draft';
  if (dbMeta.is_approved === 1 || (dbMeta.is_approved === undefined && aiMetadata?.isApproved)) {
    metadataStatus = 'approved';
  } else if (dbMeta.is_edited === 1 || (dbMeta.is_edited === undefined && aiMetadata?.isEditedByHuman)) {
    metadataStatus = 'user_edited';
  } else if (aiMetadata || dbMeta.metadata_status === 'ai_generated') {
    metadataStatus = 'ai_generated';
  }

  // Effective titles and descriptions:
  // If user edited in DB, prioritize DB. Otherwise prioritize clean AI Metadata package.
  const resolvedTitle = dbMeta.youtube_title || (aiMetadata ? aiMetadata.title : title);
  const resolvedDesc = dbMeta.youtube_description || (aiMetadata ? aiMetadata.description : (scriptExcerpt || `${title} — An original financial explainer video by ANYMYN.`));
  const resolvedTags = dbMeta.tags || (aiMetadata ? (Array.isArray(aiMetadata.tags) ? aiMetadata.tags.join(', ') : aiMetadata.tags) : 'ANYMYN, personal finance, investing, money, education');

  return {
    slug,
    title,
    status,
    hasRender: !!masterRenderPath,
    hasRenderedVideo: !!masterRenderPath,
    renderPath: masterRenderPath ? path.relative(ROOT_DIR, masterRenderPath) : null,
    videoPath: masterRenderPath,
    renderFilename: masterRenderPath ? path.basename(masterRenderPath) : null,
    renderModified: renderStats ? renderStats.mtime.toISOString() : null,
    probe: probe || {
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 0,
      durationFormatted: '0:00',
      size: 0,
      sizeFormatted: '0 B',
      videoCodec: 'h264',
      audioCodec: 'aac'
    },
    videoStream: probe ? {
      width: probe.width,
      height: probe.height,
      fps: probe.fps,
      duration: probe.duration,
      codec: probe.videoCodec,
      audioCodec: probe.audioCodec,
      bitrate: probe.bitrate,
      size: probe.size
    } : null,
    thumbnail: fs.existsSync(contactSheetPath) ? `/api/media/thumbnail/${slug}` : null,
    hasContactSheet: fs.existsSync(contactSheetPath),
    contactSheetPath: fs.existsSync(contactSheetPath) ? path.relative(ROOT_DIR, contactSheetPath) : null,
    hasScript: fs.existsSync(scriptPath),
    hasVoiceover: !!voiceoverOriginalPath || audioStems.length > 0,
    hasRetentionMap: fs.existsSync(retentionMapPath),
    hasStoryboard: fs.existsSync(storyboardPath),
    hasQcReport: fs.existsSync(qcReportPath),
    hasCalculations: fs.existsSync(calculationsPath),
    script: fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf8') : null,
    elevenLabsScript: fs.existsSync(elevenlabsScriptPath) ? fs.readFileSync(elevenlabsScriptPath, 'utf8') : null,
    retentionMap: fs.existsSync(retentionMapPath) ? fs.readFileSync(retentionMapPath, 'utf8') : null,
    storyboard: fs.existsSync(storyboardPath) ? fs.readFileSync(storyboardPath, 'utf8') : null,
    qcReport: fs.existsSync(qcReportPath) ? fs.readFileSync(qcReportPath, 'utf8') : null,
    calculations: fs.existsSync(calculationsPath) ? (() => { try { return JSON.parse(fs.readFileSync(calculationsPath, 'utf8')); } catch { return null; } })() : null,
    assets: {
      hasScript: fs.existsSync(scriptPath),
      scriptPath: fs.existsSync(scriptPath) ? path.relative(ROOT_DIR, scriptPath) : null,
      scriptWordCount,
      scriptExcerpt,
      hasElevenLabsScript: fs.existsSync(elevenlabsScriptPath),
      elevenlabsScriptPath: fs.existsSync(elevenlabsScriptPath) ? path.relative(ROOT_DIR, elevenlabsScriptPath) : null,
      hasVoiceoverDirection: fs.existsSync(voiceoverDirDoc),
      hasSceneNarrationMap: fs.existsSync(sceneNarrationMapPath),
      hasStoryboard: fs.existsSync(storyboardPath),
      hasRetentionMap: fs.existsSync(retentionMapPath),
      hasQcReport: fs.existsSync(qcReportPath),
      hasCalculations: fs.existsSync(calculationsPath),
      hasManifest: !!manifest,
      hasVoiceoverOriginal: !!voiceoverOriginalPath,
      voiceoverOriginalFilename: voiceoverOriginalPath ? path.basename(voiceoverOriginalPath) : null,
      hasMasterAudio: !!masterAudioPath,
      hasSoundtrack: !!soundtrackPath,
      stemCount: audioStems.length
    },
    metadata: {
      youtubeTitle: resolvedTitle,
      youtubeDescription: resolvedDesc,
      youtubeVideoId: latestUpload ? latestUpload.youtube_video_id : null,
      youtubeUrl: latestUpload ? latestUpload.youtube_url : null,
      uploadedAt: latestUpload ? latestUpload.created_at : null,
      tags: resolvedTags,
      categoryId: dbMeta.category_id || (aiMetadata ? aiMetadata.category : '27'),
      defaultLanguage: dbMeta.default_language || (aiMetadata ? aiMetadata.language : 'en'),
      privacyStatus: dbMeta.privacy_status || 'private', // Non-negotiable default
      scheduledPublishTime: dbMeta.scheduled_publish_time || (latestUpload ? latestUpload.scheduled_publish_time : null),
      schedulingTimezone: dbMeta.scheduling_timezone || (latestUpload ? latestUpload.scheduling_timezone : 'Asia/Kolkata'),
      isSyntheticMedia: dbMeta.is_synthetic_media !== undefined ? !!dbMeta.is_synthetic_media : (aiMetadata ? !!aiMetadata.isSynthetic : true),
      metadataStatus,
      isApproved: metadataStatus === 'approved',
      isEdited: metadataStatus === 'user_edited',
      isMetadataOutdated,
      alternativeTitles: aiMetadata ? (aiMetadata.alternativeTitles || aiMetadata.alternative_titles || []) : [],
      chapters: aiMetadata ? (aiMetadata.chapters || []) : [],
      notes: dbMeta.notes || ''
    },
    aiMetadata,
    hasAiMetadata: !!aiMetadata,
    isMetadataOutdated,
    metadataStatus,
    alternativeTitles: aiMetadata ? (aiMetadata.alternativeTitles || aiMetadata.alternative_titles || []) : [],
    chapters: aiMetadata ? (aiMetadata.chapters || []) : [],
    latestUpload: latestUpload ? {
      id: latestUpload.id,
      youtubeVideoId: latestUpload.youtube_video_id,
      youtubeUrl: latestUpload.youtube_url,
      privacyStatus: latestUpload.privacy_status,
      status: latestUpload.status,
      errorMessage: latestUpload.error_message,
      scheduledPublishTime: latestUpload.scheduled_publish_time,
      schedulingTimezone: latestUpload.scheduling_timezone,
      uploadedAt: latestUpload.created_at
    } : null
  };
}

function scanAllProjects() {
  if (!fs.existsSync(VIDEOS_DIR)) return [];
  const entries = fs.readdirSync(VIDEOS_DIR);
  const projects = [];

  for (const entry of entries) {
    const fullPath = path.join(VIDEOS_DIR, entry);
    if (fs.statSync(fullPath).isDirectory() && !entry.startsWith('.')) {
      const proj = scanProject(entry);
      if (proj) projects.push(proj);
    }
  }

  // Sort by render modified date or slug
  projects.sort((a, b) => {
    if (a.renderModified && b.renderModified) {
      return new Date(b.renderModified) - new Date(a.renderModified);
    }
    return a.slug.localeCompare(b.slug);
  });

  return projects;
}

function getOverviewStats() {
  const projects = scanAllProjects();
  const allUploads = UploadLedger.getAll();

  const total = projects.length;
  const completed = projects.filter(p => p.hasRender).length;
  const awaitingVo = projects.filter(p => p.status === 'AWAITING_VOICEOVER').length;
  const awaitingRender = projects.filter(p => p.status === 'AWAITING_RENDER').length;
  const readyToPublish = projects.filter(p => p.status === 'READY_TO_PUBLISH').length;
  const scheduled = projects.filter(p => p.status === 'SCHEDULED').length;
  const uploaded = projects.filter(p => p.status === 'UPLOADED' || p.status === 'SCHEDULED' || p.status === 'PUBLISHED').length;
  const published = projects.filter(p => p.status === 'PUBLISHED').length;

  const totalRenderBytes = projects.reduce((acc, p) => acc + (p.probe.size || 0), 0);
  const totalDurationSecs = projects.reduce((acc, p) => acc + (p.probe.duration || 0), 0);

  return {
    total,
    totalProjects: total,
    completed,
    renderedProjects: completed,
    awaitingVo,
    awaitingRender,
    readyToPublish,
    scheduled,
    scheduledProjects: scheduled,
    uploaded,
    published,
    totalSizeBytes: totalRenderBytes,
    totalRenderBytesFormatted: formatBytes(totalRenderBytes),
    totalDurationFormatted: formatDuration(totalDurationSecs),
    totalDurationSeconds: Math.round(totalDurationSecs),
    recentUploadsCount: allUploads.length
  };
}

module.exports = {
  ROOT_DIR,
  VIDEOS_DIR,
  STUDIO_RENDERS_DIR,
  probeVideo,
  scanProject,
  scanAllProjects,
  getOverviewStats,
  formatBytes,
  formatDuration
};
