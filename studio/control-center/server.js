const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const multer = require('multer');

const { 
  ProjectMeta, 
  ActivityLog, 
  UploadLedger,
  YouTubeVideos,
  YouTubeSyncState,
  YouTubePlaylists,
  YouTubePlaylistItems,
  YouTubeAuditLog 
} = require('./db');
const {
  scanAllProjects,
  scanProject,
  getOverviewStats,
  ROOT_DIR,
  VIDEOS_DIR,
  STUDIO_RENDERS_DIR
} = require('./scanner');

const {
  getRedirectUri,
  getAuthUrl,
  handleOAuthCallback,
  getChannelProfile,
  uploadVideo,
  getUploadProgress,
  scheduleExistingVideo,
  cancelScheduledVideo,
  getScheduleList,
  syncChannelVideos,
  getGrantedPermissions,
  updateVideoVisibility,
  updateVideoMetadata,
  updateVideoThumbnail,
  syncPlaylists,
  createPlaylist,
  getPlaylistVideos,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getChannelAnalytics,
  getVideoAnalytics,
  exportAnalyticsCSV,
  getChannelComments,
  replyToComment,
  moderateComment,
  listVideoCaptions
} = require('./youtube');

const {
  generateProjectMetadata,
  generateAllMetadata
} = require('./metadata_generator');

const app = express();
const PORT = process.env.PORT || 4242;

// Multer storage for custom thumbnail uploads
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const uploadStorage = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 4 * 1024 * 1024 }
});
const HOST = '127.0.0.1'; // STRICT REQUIREMENT: Bind to 127.0.0.1, not 0.0.0.0

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Safe path validation to prevent path traversal
function isSafeSlug(slug) {
  return /^[a-zA-Z0-9_-]+$/.test(slug) && !slug.includes('..');
}

// -------------------------------------------------------------
// 1. Overview & Statistics API
// -------------------------------------------------------------
app.get('/api/overview', (req, res) => {
  try {
    const stats = getOverviewStats();
    const recentActivity = ActivityLog.getRecent(15);
    const projects = scanAllProjects();
    const recentVideos = projects.slice(0, 4);

    const youtubeStats = YouTubeVideos.getSummaryStats();
    const syncState = YouTubeSyncState.get();
    const channelVideos = YouTubeVideos.getAll({ limit: 4 });
    const permissions = getGrantedPermissions();
    const recentAudit = YouTubeAuditLog.getRecent(10);

    res.json({
      success: true,
      stats,
      recentVideos,
      recentActivity,
      youtubeStats,
      syncState,
      channelVideos,
      permissions,
      recentAudit
    });
  } catch (err) {
    console.error('Error getting overview:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 2. Video Projects API
// -------------------------------------------------------------
app.get('/api/projects', (req, res) => {
  try {
    const { status, search } = req.query;
    let projects = scanAllProjects();

    if (status && status !== 'all') {
      projects = projects.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      projects = projects.filter(p =>
        p.slug.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.metadata && p.metadata.youtubeTitle.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('Error listing projects:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/projects/:slug', (req, res) => {
  const { slug } = req.params;
  if (!isSafeSlug(slug)) {
    return res.status(400).json({ success: false, error: 'Invalid project slug' });
  }

  try {
    const project = scanProject(slug);
    if (!project) {
      return res.status(404).json({ success: false, error: `Project '${slug}' not found` });
    }

    // Read full documents if available
    const projectDir = path.join(VIDEOS_DIR, slug);
    const documents = {};

    const docMap = {
      script: path.join(projectDir, 'script', 'script.md'),
      elevenlabsScript: path.join(projectDir, 'voiceover', 'elevenlabs_script.txt'),
      voiceoverDirection: path.join(projectDir, 'voiceover', 'voiceover_direction.md'),
      sceneNarrationMap: path.join(projectDir, 'voiceover', 'scene_narration_map.md'),
      retentionMap: path.join(projectDir, 'retention_map.md'),
      storyboard: path.join(projectDir, 'storyboard', 'storyboard.md'),
      qcReport: path.join(projectDir, 'qc', 'qc_report.md'),
      readme: path.join(projectDir, 'README.md')
    };

    for (const [key, filePath] of Object.entries(docMap)) {
      if (fs.existsSync(filePath)) {
        try {
          documents[key] = fs.readFileSync(filePath, 'utf8');
        } catch (_) {
          documents[key] = null;
        }
      } else {
        documents[key] = null;
      }
    }

    // Calculations
    const calcPath = path.join(projectDir, 'research', 'verified_calculations.json');
    let calculations = null;
    if (fs.existsSync(calcPath)) {
      try {
        calculations = JSON.parse(fs.readFileSync(calcPath, 'utf8'));
      } catch (_) {}
    }

    const uploadHistory = UploadLedger.getByProject(slug);

    res.json({
      success: true,
      project: {
        ...project,
        documents,
        calculations,
        uploadHistory
      }
    });
  } catch (err) {
    console.error(`Error fetching project ${slug}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const handleSaveMetadata = (req, res) => {
  const { slug } = req.params;
  if (!isSafeSlug(slug)) {
    return res.status(400).json({ success: false, error: 'Invalid project slug' });
  }

  try {
    const {
      youtubeTitle,
      youtubeDescription,
      tags,
      youtubeTags,
      categoryId,
      youtubeCategory,
      defaultLanguage,
      youtubeLanguage,
      privacyStatus,
      scheduledPublishTime,
      isSyntheticMedia,
      notes
    } = req.body;

    const finalTags = tags !== undefined ? tags : youtubeTags;
    const finalCategory = categoryId || youtubeCategory || '27';
    const finalLanguage = defaultLanguage || youtubeLanguage || 'en';

    // Safety guard on privacy
    let validatedPrivacy = (privacyStatus || 'private').toLowerCase();
    if (!['private', 'unlisted', 'public'].includes(validatedPrivacy)) {
      validatedPrivacy = 'private';
    }

    const saved = ProjectMeta.save(slug, {
      youtube_title: youtubeTitle,
      youtube_description: youtubeDescription,
      tags: typeof finalTags === 'object' && finalTags !== null ? (Array.isArray(finalTags) ? finalTags.join(', ') : JSON.stringify(finalTags)) : finalTags,
      category_id: finalCategory,
      default_language: finalLanguage,
      privacy_status: validatedPrivacy,
      scheduled_publish_time: scheduledPublishTime,
      is_synthetic_media: isSyntheticMedia ? 1 : 0,
      metadata_status: 'user_edited',
      is_edited: 1,
      notes: notes || ''
    });

    // Update deliverable file on disk if present
    const metaPath = path.join(VIDEOS_DIR, slug, 'youtube_metadata.json');
    if (fs.existsSync(metaPath)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        fileData.title = youtubeTitle || fileData.title;
        fileData.description = youtubeDescription || fileData.description;
        if (finalTags) {
          fileData.tags = typeof finalTags === 'string' ? finalTags.split(',').map(t => t.trim()).filter(Boolean) : finalTags;
        }
        fileData.category = finalCategory;
        fileData.language = finalLanguage;
        fileData.isEditedByHuman = true;
        fileData.status = 'user_edited';
        fileData.updatedAt = new Date().toISOString();
        fs.writeFileSync(metaPath, JSON.stringify(fileData, null, 2), 'utf8');
      } catch (err) {
        console.warn(`Could not sync edits to ${metaPath}:`, err.message);
      }
    }

    ActivityLog.add(
      'METADATA_UPDATED',
      slug,
      'Publishing Metadata Updated',
      `Saved YouTube draft: "${youtubeTitle || slug}" (${validatedPrivacy})`
    );

    res.json({ success: true, metadata: saved });
  } catch (err) {
    console.error(`Error saving metadata for ${slug}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

app.put('/api/projects/:slug/metadata', handleSaveMetadata);
app.post('/api/projects/:slug/metadata', handleSaveMetadata);

app.post('/api/projects/:slug/metadata/generate', (req, res) => {
  const { slug } = req.params;
  const { force = false, stage = 'STAGE_B_FINAL' } = req.body || {};
  if (!isSafeSlug(slug)) return res.status(400).json({ success: false, error: 'Invalid slug' });

  try {
    const generated = generateProjectMetadata(slug, { force, stage });
    res.json({ success: true, metadata: generated });
  } catch (err) {
    console.error(`Error generating metadata for ${slug}:`, err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/projects/:slug/metadata/approve', (req, res) => {
  const { slug } = req.params;
  if (!isSafeSlug(slug)) return res.status(400).json({ success: false, error: 'Invalid slug' });

  try {
    const saved = ProjectMeta.save(slug, {
      metadata_status: 'approved',
      is_approved: 1
    });

    const metaPath = path.join(VIDEOS_DIR, slug, 'youtube_metadata.json');
    if (fs.existsSync(metaPath)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        fileData.isApproved = true;
        fileData.status = 'approved';
        fileData.updatedAt = new Date().toISOString();
        fs.writeFileSync(metaPath, JSON.stringify(fileData, null, 2), 'utf8');
      } catch (_) {}
    }

    ActivityLog.add('METADATA_APPROVED', slug, 'Metadata Approved', 'Publishing metadata approved for YouTube release');
    res.json({ success: true, metadata: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects/:slug/metadata/restore', (req, res) => {
  const { slug } = req.params;
  if (!isSafeSlug(slug)) return res.status(400).json({ success: false, error: 'Invalid slug' });

  try {
    const metaPath = path.join(VIDEOS_DIR, slug, 'youtube_metadata.json');
    if (!fs.existsSync(metaPath)) {
      return res.status(404).json({ success: false, error: 'No generated youtube_metadata.json deliverable found to restore.' });
    }

    const fileData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    fileData.isEditedByHuman = false;
    fileData.isApproved = false;
    fileData.status = 'ai_generated';
    fileData.updatedAt = new Date().toISOString();
    fs.writeFileSync(metaPath, JSON.stringify(fileData, null, 2), 'utf8');

    const saved = ProjectMeta.save(slug, {
      youtube_title: fileData.title,
      youtube_description: fileData.description,
      tags: Array.isArray(fileData.tags) ? fileData.tags.join(', ') : fileData.tags,
      category_id: fileData.category || '27',
      default_language: fileData.language || 'en',
      metadata_status: 'ai_generated',
      is_edited: 0,
      is_approved: 0
    });

    ActivityLog.add('METADATA_RESTORED', slug, 'AI Metadata Restored', 'Restored original AI generated metadata package');
    res.json({ success: true, metadata: saved, aiMetadata: fileData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 3. Media Streaming API (HTTP Range Partial Content 206)
// -------------------------------------------------------------
app.get('/api/media/stream/:slug', (req, res) => {
  const { slug } = req.params;
  if (!isSafeSlug(slug)) {
    return res.status(400).send('Invalid slug');
  }

  const project = scanProject(slug);
  if (!project || !project.renderPath) {
    return res.status(404).send('Rendered video not found');
  }

  const fullPath = path.join(ROOT_DIR, project.renderPath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('Video file missing on disk');
  }

  const stat = fs.statSync(fullPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send(`Requested range not satisfiable: ${start} >= ${fileSize}`);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(fullPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes'
    };
    res.writeHead(200, head);
    fs.createReadStream(fullPath).pipe(res);
  }
});

// Audio streaming route for voiceover & master tracks
app.get('/api/media/audio/:slug/:file', (req, res) => {
  const { slug, file } = req.params;
  if (!isSafeSlug(slug) || !isSafeSlug(file.replace(/\.[a-zA-Z0-9]+$/, ''))) {
    return res.status(400).send('Invalid audio request');
  }

  const audioPath = path.join(VIDEOS_DIR, slug, 'audio', file);
  if (!fs.existsSync(audioPath)) {
    return res.status(404).send('Audio file not found');
  }

  const stat = fs.statSync(audioPath);
  const fileSize = stat.size;
  const mimeType = file.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const stream = fs.createReadStream(audioPath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType
    });
    stream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(audioPath).pipe(res);
  }
});

// Thumbnail extraction & serving
app.get('/api/media/thumbnail/:slug', (req, res) => {
  const { slug } = req.params;
  if (!isSafeSlug(slug)) return res.status(400).send('Invalid slug');

  const contactSheet = path.join(VIDEOS_DIR, slug, 'qc', 'contact_sheet.png');
  if (fs.existsSync(contactSheet)) {
    return res.sendFile(contactSheet);
  }

  // Look for any frame in qc/frames/
  const framesDir = path.join(VIDEOS_DIR, slug, 'qc', 'frames');
  if (fs.existsSync(framesDir)) {
    const frames = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
    if (frames.length > 0) {
      return res.sendFile(path.join(framesDir, frames[0]));
    }
  }

  // Extract on-demand still frame using ffmpeg if master render exists
  const project = scanProject(slug);
  if (project && project.renderPath) {
    try {
      const fullVideoPath = path.join(ROOT_DIR, project.renderPath);
      const tempThumb = path.join(__dirname, 'data', `thumb_${slug}.png`);
      if (!fs.existsSync(tempThumb)) {
        execSync(
          `ffmpeg -y -ss 00:00:03 -i "${fullVideoPath}" -vframes 1 -q:v 2 "${tempThumb}"`,
          { timeout: 4000 }
        );
      }
      if (fs.existsSync(tempThumb)) {
        return res.sendFile(tempThumb);
      }
    } catch (_) {}
  }

  res.status(404).send('No thumbnail available');
});

// -------------------------------------------------------------
// 4. YouTube Integration API
// -------------------------------------------------------------
app.get('/api/youtube/status', async (req, res) => {
  try {
    const profile = await getChannelProfile(PORT);
    res.json({
      success: true,
      profile,
      authenticated: !!profile.connected,
      channel: profile.connected ? profile : null,
      redirectUri: getRedirectUri(PORT)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/youtube/credentials', (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) {
      return res.status(400).json({ success: false, error: 'Client ID and Client Secret are required' });
    }

    const { YouTubeAuth } = require('./db');
    YouTubeAuth.saveCredentials(clientId, clientSecret);
    const authUrl = getAuthUrl(clientId, clientSecret, PORT);

    res.json({
      success: true,
      authUrl,
      redirectUri: getRedirectUri(PORT),
      message: 'Credentials saved. Proceed to authorization URL.'
    });
  } catch (err) {
    console.error('Error saving credentials:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/youtube/credentials', (req, res) => {
  try {
    const { YouTubeAuth } = require('./db');
    const authRecord = YouTubeAuth.get();
    res.json({
      success: true,
      configured: !!(authRecord?.client_id && authRecord?.client_secret),
      clientId: authRecord?.client_id || '',
      hasSecret: !!authRecord?.client_secret
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const handleGetAuthUrl = (req, res) => {
  try {
    const { YouTubeAuth } = require('./db');
    const authRecord = YouTubeAuth.get();
    if (!authRecord || !authRecord.client_id || !authRecord.client_secret) {
      return res.status(400).json({
        success: false,
        error: 'Google Cloud OAuth credentials not configured. Please supply Client ID and Secret in settings.'
      });
    }

    const authUrl = getAuthUrl(authRecord.client_id, authRecord.client_secret, PORT);
    res.json({ success: true, authUrl, redirectUri: getRedirectUri(PORT) });
  } catch (err) {
    console.error('Error generating auth URL:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/youtube/auth-url', handleGetAuthUrl);
app.get('/api/youtube/oauth/url', handleGetAuthUrl);

// Official Desktop/Local OAuth2 Loopback Callback
app.get('/api/youtube/oauth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.send(`
      <html>
        <body style="font-family: serif; background: #F3EFE5; color: #241F19; padding: 40px; text-align: center;">
          <h2 style="color: #9E2A2B;">Google Authorization Failed</h2>
          <p>${error}</p>
          <p><a href="/" style="color: #C58A35; font-weight: bold;">Return to ANYMYN Studio</a></p>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    const result = await handleOAuthCallback(code, PORT);
    res.send(`
      <html>
        <head>
          <title>ANYMYN Studio — YouTube Connected</title>
        </head>
        <body style="font-family: -apple-system, sans-serif; background: #F3EFE5; color: #241F19; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="background: #FAF8F5; border: 1px solid #D8CEBA; border-radius: 16px; padding: 48px; max-width: 480px; text-align: center; box-shadow: 0 20px 40px rgba(80,68,52,0.1);">
            <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
            <h2 style="font-family: serif; margin: 0 0 12px 0; font-size: 28px;">YouTube Connected</h2>
            <p style="color: #756A5B; font-size: 16px; margin: 0 0 24px 0;">
              Connected channel: <strong>${result.channel.title || 'YouTube Channel'}</strong>. You may close this tab and return to ANYMYN Studio.
            </p>
            <a href="/" style="display: inline-block; background: #C58A35; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600;">
              Return to Studio
            </a>
          </div>
          <script>
            setTimeout(() => { window.location.href = '/'; }, 2500);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});

app.post('/api/youtube/disconnect', (req, res) => {
  try {
    const { YouTubeAuth } = require('./db');
    YouTubeAuth.disconnect();
    ActivityLog.add('YOUTUBE_DISCONNECTED', null, 'YouTube Account Disconnected', 'Cleared credentials and tokens');
    res.json({ success: true, message: 'YouTube account disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Resumable YouTube Upload Trigger
const handleUploadVideo = async (req, res) => {
  const slug = req.params.slug || req.body.projectSlug;
  if (!slug || !isSafeSlug(slug)) return res.status(400).json({ success: false, error: 'Invalid slug' });

  try {
    const project = scanProject(slug);
    if (!project || !project.renderPath) {
      return res.status(400).json({ success: false, error: 'No rendered video found for this project.' });
    }

    const {
      title,
      description,
      tags,
      categoryId,
      defaultLanguage,
      privacyStatus,
      scheduledPublishTime,
      isSyntheticMedia,
      confirmPublic
    } = req.body;

    const validatedPrivacy = (privacyStatus || 'private').toLowerCase();

    // SAFETY ENFORCEMENT: If user chooses public or scheduled, require explicit confirmation
    if (validatedPrivacy === 'public' && !confirmPublic) {
      return res.status(400).json({
        success: false,
        requiresConfirmation: true,
        message: 'Publishing publicly requires explicit confirmation. Please confirm you want to make this video public immediately.'
      });
    }

    const fullVideoPath = path.join(ROOT_DIR, project.renderPath);
    const thumbnailPath = project.contactSheetPath ? path.join(ROOT_DIR, project.contactSheetPath) : null;

    const uploadSession = await uploadVideo({
      projectSlug: slug,
      videoFilePath: fullVideoPath,
      thumbnailPath,
      title: title || project.title,
      description: description || project.metadata.youtubeDescription,
      tags: tags || project.metadata.tags,
      categoryId: categoryId || '27',
      defaultLanguage: defaultLanguage || 'en',
      privacyStatus: validatedPrivacy,
      scheduledPublishTime,
      isSyntheticMedia: !!isSyntheticMedia,
      port: PORT
    });

    res.json({
      success: true,
      uploadId: uploadSession.uploadId,
      message: 'Upload started successfully.'
    });
  } catch (err) {
    console.error('Error starting upload:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/youtube/upload/:slug', handleUploadVideo);
app.post('/api/youtube/upload', handleUploadVideo);

app.get('/api/youtube/upload-progress/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  const progress = getUploadProgress(uploadId);
  if (!progress) {
    return res.status(404).json({ success: false, error: 'Upload not found' });
  }
  res.json({ success: true, progress });
});

app.get('/api/youtube/uploads', (req, res) => {
  try {
    const history = UploadLedger.getAll();
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// YouTube Schedule Management API
// -------------------------------------------------------------
app.get('/api/youtube/schedule', async (req, res) => {
  try {
    const schedule = await getScheduleList(PORT);
    res.json({ success: true, count: schedule.length, schedule });
  } catch (err) {
    console.error('Error fetching schedule list:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/youtube/schedule/:slug', async (req, res) => {
  const { slug } = req.params;
  const { scheduledPublishTime, timezone = 'Asia/Kolkata' } = req.body || {};
  if (!isSafeSlug(slug)) return res.status(400).json({ success: false, error: 'Invalid slug' });

  try {
    const project = scanProject(slug);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const videoId = project.metadata?.youtubeVideoId;
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Video has not been uploaded to YouTube yet. Use the Upload & Schedule flow in Workspace.'
      });
    }

    const result = await scheduleExistingVideo({
      projectSlug: slug,
      videoId,
      scheduledPublishTime,
      timezone,
      port: PORT
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`Error scheduling video for ${slug}:`, err);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/youtube/cancel-schedule/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!isSafeSlug(slug)) return res.status(400).json({ success: false, error: 'Invalid slug' });

  try {
    const project = scanProject(slug);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const videoId = project.metadata?.youtubeVideoId;
    if (!videoId) {
      ProjectMeta.save(slug, { scheduled_publish_time: null, youtube_status: 'not_uploaded' });
      return res.json({ success: true, message: 'Local schedule cleared.' });
    }

    const result = await cancelScheduledVideo({
      projectSlug: slug,
      videoId,
      port: PORT
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`Error cancelling schedule for ${slug}:`, err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 5. YouTube Channel Management API
// -------------------------------------------------------------

// Channel Synchronization Trigger
app.post('/api/youtube/sync', async (req, res) => {
  try {
    const result = await syncChannelVideos({ force: true, port: PORT });
    const summary = YouTubeVideos.getSummaryStats();
    res.json({ success: true, ...result, summary });
  } catch (err) {
    console.error('Channel synchronization error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/youtube/sync-status', (req, res) => {
  try {
    const state = YouTubeSyncState.get();
    const summary = YouTubeVideos.getSummaryStats();
    res.json({ success: true, syncState: state, summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Permissions Check
app.get('/api/youtube/permissions', (req, res) => {
  try {
    const permissions = getGrantedPermissions();
    res.json({ success: true, permissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List Channel Videos with Filter, Search, Pagination
app.get('/api/youtube/videos', (req, res) => {
  try {
    const { 
      privacyStatus = 'all', 
      source = 'all', 
      search = '', 
      limit = 100, 
      offset = 0 
    } = req.query;

    const videos = YouTubeVideos.getAll({
      privacyStatus,
      source,
      search,
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0
    });

    const total = YouTubeVideos.getCount({ privacyStatus, source, search });
    const summary = YouTubeVideos.getSummaryStats();
    const syncState = YouTubeSyncState.get();

    res.json({
      success: true,
      count: videos.length,
      total,
      summary,
      lastSyncedAt: syncState?.last_synced_at || null,
      videos
    });
  } catch (err) {
    console.error('Error listing YouTube videos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Single Video Details + Audit Trail
app.get('/api/youtube/videos/:videoId', (req, res) => {
  const { videoId } = req.params;
  try {
    const video = YouTubeVideos.get(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: `Video ${videoId} not found in channel database.` });
    }

    let linkedProject = null;
    if (video.local_project_slug) {
      linkedProject = scanProject(video.local_project_slug);
    }

    const auditTrail = YouTubeAuditLog.getByVideo(videoId, 20);

    res.json({
      success: true,
      video,
      linkedProject,
      auditTrail
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Video Visibility Management (Private <-> Unlisted <-> Public)
app.post('/api/youtube/videos/:videoId/visibility', async (req, res) => {
  const { videoId } = req.params;
  const { privacyStatus, confirmPublic = false } = req.body || {};

  try {
    const result = await updateVideoVisibility({
      videoId,
      privacyStatus,
      confirmPublic,
      port: PORT
    });

    if (result.requiresConfirmation) {
      return res.status(200).json({
        success: false,
        requiresConfirmation: true,
        message: result.message
      });
    }

    if (result.requiresPermissionUpgrade) {
      return res.status(403).json({
        success: false,
        requiresPermissionUpgrade: true,
        authUrl: result.authUrl,
        message: result.message
      });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`Error updating visibility for video ${videoId}:`, err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Video Metadata Management (Title, Description, Tags, Category, Language)
app.put('/api/youtube/videos/:videoId/metadata', async (req, res) => {
  const { videoId } = req.params;
  const { title, description, tags, categoryId, defaultLanguage } = req.body || {};

  try {
    const result = await updateVideoMetadata({
      videoId,
      title,
      description,
      tags,
      categoryId,
      defaultLanguage,
      port: PORT
    });

    if (result.requiresPermissionUpgrade) {
      return res.status(403).json({
        success: false,
        requiresPermissionUpgrade: true,
        authUrl: result.authUrl,
        message: result.message
      });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`Error updating metadata for video ${videoId}:`, err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Custom Thumbnail Replacement
app.post('/api/youtube/videos/:videoId/thumbnail', uploadStorage.single('thumbnail'), async (req, res) => {
  const { videoId } = req.params;
  const filePath = req.file ? req.file.path : req.body.filePath;

  if (!filePath) {
    return res.status(400).json({ success: false, error: 'Thumbnail image file is required.' });
  }

  try {
    const result = await updateVideoThumbnail({
      videoId,
      filePath,
      port: PORT
    });

    if (result.requiresPermissionUpgrade) {
      return res.status(403).json({
        success: false,
        requiresPermissionUpgrade: true,
        authUrl: result.authUrl,
        message: result.message
      });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`Error replacing thumbnail for video ${videoId}:`, err);
    res.status(400).json({ success: false, error: err.message });
  } finally {
    // Clean up temp multer upload if used
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
  }
});

// Playlists Management API
app.get('/api/youtube/playlists', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    let playlists = YouTubePlaylists.getAll();
    if (force || playlists.length === 0) {
      playlists = await syncPlaylists({ port: PORT, force: true });
    }
    res.json({ success: true, count: playlists.length, playlists });
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/youtube/playlists', async (req, res) => {
  const { title, description = '', privacyStatus = 'public' } = req.body || {};
  try {
    const result = await createPlaylist({ title, description, privacyStatus, port: PORT });
    if (result.requiresPermissionUpgrade) {
      return res.status(403).json(result);
    }
    res.json({ success: true, playlist: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/youtube/playlists/:playlistId/items', async (req, res) => {
  const { playlistId } = req.params;
  try {
    const items = await getPlaylistVideos({ playlistId, port: PORT });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/youtube/playlists/:playlistId/items', async (req, res) => {
  const { playlistId } = req.params;
  const { videoId, position } = req.body || {};
  try {
    const result = await addVideoToPlaylist({ playlistId, videoId, position, port: PORT });
    if (result.requiresPermissionUpgrade) {
      return res.status(403).json(result);
    }
    res.json({ success: true, item: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/youtube/playlists/items/:playlistItemId', async (req, res) => {
  const { playlistItemId } = req.params;
  const { playlistId, videoId } = req.query;
  try {
    const result = await removeVideoFromPlaylist({ playlistItemId, playlistId, videoId, port: PORT });
    if (result.requiresPermissionUpgrade) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// YouTube Analytics API
app.get('/api/youtube/analytics', async (req, res) => {
  const { range = '28d' } = req.query;
  try {
    const report = await getChannelAnalytics({ range, port: PORT });
    res.json({ success: true, report });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/youtube/analytics/video/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const { range = '28d' } = req.query;
  try {
    const report = await getVideoAnalytics({ videoId, range, port: PORT });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/youtube/analytics/export', async (req, res) => {
  const { range = '28d' } = req.query;
  try {
    const report = await getChannelAnalytics({ range, port: PORT });
    if (!report.available) {
      return res.status(400).send('Analytics data not available');
    }
    const csv = exportAnalyticsCSV(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="youtube_analytics_${range}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).send(`Failed to export CSV: ${err.message}`);
  }
});

// Comments & Moderation API
app.get('/api/youtube/comments', async (req, res) => {
  const { videoId, moderationStatus = 'published', maxResults = 50 } = req.query;
  try {
    const result = await getChannelComments({ videoId, moderationStatus, maxResults: parseInt(maxResults, 10) || 50, port: PORT });
    res.json(result);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/youtube/comments/reply', async (req, res) => {
  const { parentId, text } = req.body || {};
  try {
    const result = await replyToComment({ parentId, text, port: PORT });
    if (result.requiresPermissionUpgrade) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/youtube/comments/moderate', async (req, res) => {
  const { commentId, moderationStatus, banAuthor = false } = req.body || {};
  try {
    const result = await moderateComment({ commentId, moderationStatus, banAuthor, port: PORT });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Captions API
app.get('/api/youtube/videos/:videoId/captions', async (req, res) => {
  const { videoId } = req.params;
  try {
    const result = await listVideoCaptions({ videoId, port: PORT });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Audit History API
app.get('/api/youtube/audit', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  try {
    const history = YouTubeAuditLog.getRecent(limit);
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 6. Frontend Static Serving & Fallback
// -------------------------------------------------------------
const PUBLIC_DIR = path.join(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
}

const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  // Graceful fallback before build
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <body style="font-family: serif; background: #F3EFE5; color: #241F19; padding: 48px; text-align: center;">
          <h1>ANYMYN STUDIO Backend Active</h1>
          <p style="color: #756A5B;">API is listening on <strong>http://${HOST}:${PORT}</strong>. Frontend build pending.</p>
        </body>
      </html>
    `);
  });
}

// -------------------------------------------------------------
// 6. Automatic Port Recovery & Server Startup
// -------------------------------------------------------------
function freePortIfOccupied(targetPort) {
  try {
    const raw = execSync(`lsof -ti :${targetPort} 2>/dev/null || ss -lptn "sport = :${targetPort}" 2>/dev/null | grep -oP 'pid=\\K[0-9]+' || true`, {
      encoding: 'utf8'
    }).trim();

    if (!raw) return false;

    const pids = raw.split('\n').map(p => p.trim()).filter(Boolean);
    let freed = false;

    for (const pidStr of pids) {
      const pid = parseInt(pidStr, 10);
      if (pid && pid !== process.pid) {
        console.log(`[ANYMYN Studio] Reclaiming port ${targetPort} from lingering process (PID ${pid})...`);
        try {
          process.kill(pid, 'SIGTERM');
          freed = true;
        } catch (_) {
          try {
            process.kill(pid, 'SIGKILL');
            freed = true;
          } catch (__) {}
        }
      }
    }

    if (freed) {
      // Synchronous wait for kernel socket release
      const start = Date.now();
      while (Date.now() - start < 350) {}
    }
    return freed;
  } catch (err) {
    return false;
  }
}

let activeServer = null;
let boundPort = Number(PORT);

function startServer(targetPort, retries = 2) {
  boundPort = targetPort;
  const srv = app.listen(targetPort, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`  ANYMYN STUDIO — Local Video Control Center`);
    console.log(`  Running on http://${HOST}:${targetPort}`);
    console.log(`  Binds exclusively to localhost (${HOST})`);
    console.log(`======================================================\n`);

    // Intelligent background channel sync on boot
    syncChannelVideos({ force: false, port: targetPort }).catch(err => {
      console.log('[ANYMYN Studio Boot] Initial channel sync deferred:', err.message);
    });
  });

  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (retries > 0) {
        console.log(`[ANYMYN Studio] Port ${targetPort} is in use. Attempting automatic recovery...`);
        const reclaimed = freePortIfOccupied(targetPort);
        if (reclaimed) {
          setTimeout(() => {
            startServer(targetPort, retries - 1);
          }, 350);
          return;
        }

        const nextPort = targetPort + 1;
        console.warn(`[ANYMYN Studio] Port ${targetPort} could not be freed. Trying alternative port ${nextPort}...`);
        startServer(nextPort, retries - 1);
      } else {
        console.error(`\n[ANYMYN Studio Error] Could not bind to port ${targetPort}.`);
        console.error(`Please inspect or terminate conflicting processes with: lsof -i :${targetPort}\n`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  activeServer = srv;
  return srv;
}

// Check port on boot and start server
startServer(Number(PORT));

module.exports = { app, server: activeServer, getBoundPort: () => boundPort };
