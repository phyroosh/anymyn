const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { YouTubeAuth, UploadLedger, ActivityLog, ProjectMeta, YouTubeVideos, YouTubeSyncState } = require('./db');

const { SCOPES, getRedirectUri, getOAuthClient, getAuthUrl } = require('./youtube_client');

let activeUploads = new Map(); // uploadId -> { progress, bytesUploaded, totalBytes, status, error }

async function handleOAuthCallback(code, port = 4242) {
  const authRecord = YouTubeAuth.get();
  if (!authRecord || !authRecord.client_id || !authRecord.client_secret) {
    throw new Error('Google Cloud OAuth credentials not found. Please provide Client ID and Secret first.');
  }

  const oauth2Client = new google.auth.OAuth2(
    authRecord.client_id,
    authRecord.client_secret,
    getRedirectUri(port)
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch channel info
  let channelInfo = { id: null, title: null, thumbnail: null };
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true
    });

    if (response.data.items && response.data.items.length > 0) {
      const ch = response.data.items[0];
      channelInfo = {
        id: ch.id,
        title: ch.snippet.title,
        thumbnail: ch.snippet.thumbnails?.default?.url || null
      };
    }
  } catch (err) {
    console.warn('[YouTube Auth] Could not fetch channel profile:', err.message);
  }

  YouTubeAuth.saveTokens(tokens, channelInfo);
  ActivityLog.add(
    'YOUTUBE_CONNECTED',
    null,
    'YouTube Account Connected',
    `Connected channel: ${channelInfo.title || 'YouTube Channel'}`
  );

  return {
    success: true,
    channel: channelInfo
  };
}

async function getChannelProfile(port = 4242) {
  const authRecord = YouTubeAuth.get();
  if (!authRecord || !authRecord.client_id) {
    return {
      configured: false,
      connected: false,
      hasClientId: false
    };
  }

  const hasCredentials = !!(authRecord.client_id && authRecord.client_secret);
  const isAuthorized = !!(authRecord.access_token || authRecord.refresh_token);

  if (!isAuthorized) {
    return {
      configured: hasCredentials,
      connected: false,
      clientId: authRecord.client_id ? `${authRecord.client_id.slice(0, 12)}...` : null
    };
  }

  const { getGrantedPermissions } = require('./youtube_manage');
  const syncState = YouTubeSyncState.get() || {};
  const summaryStats = YouTubeVideos.getSummaryStats();
  const permissions = getGrantedPermissions();

  return {
    configured: true,
    connected: true,
    id: authRecord.channel_id,
    channelId: authRecord.channel_id,
    title: syncState.channel_title || authRecord.channel_title || 'Connected Channel',
    channelTitle: syncState.channel_title || authRecord.channel_title || 'Connected Channel',
    thumbnail: syncState.channel_thumbnail || authRecord.channel_thumbnail,
    channelThumbnail: syncState.channel_thumbnail || authRecord.channel_thumbnail,
    customUrl: syncState.channel_custom_url || null,
    subscriberCount: syncState.subscriber_count || '0',
    totalViews: syncState.total_views || '0',
    totalVideos: syncState.total_videos || 0,
    lastSyncedAt: syncState.last_synced_at || null,
    expiryDate: authRecord.expiry_date,
    permissions,
    syncState,
    summaryStats
  };
}

async function uploadVideo({
  projectSlug,
  videoFilePath,
  thumbnailPath = null,
  title,
  description,
  tags = '',
  categoryId = '27',
  defaultLanguage = 'en',
  privacyStatus = 'private',
  scheduledPublishTime = null,
  timezone = 'Asia/Kolkata',
  isSyntheticMedia = false,
  isMock = false,
  port = 4242
}) {
  const uploadId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  if (!fs.existsSync(videoFilePath)) {
    throw new Error(`Video file not found at ${videoFilePath}`);
  }

  const fileStats = fs.statSync(videoFilePath);
  const totalBytes = fileStats.size;

  // Initialize DB upload record
  UploadLedger.create({
    id: uploadId,
    project_slug: projectSlug,
    title: title,
    privacy_status: privacyStatus,
    status: 'uploading',
    bytes_uploaded: 0,
    total_bytes: totalBytes,
    scheduled_publish_time: scheduledPublishTime || null,
    scheduling_timezone: timezone || 'Asia/Kolkata'
  });

  activeUploads.set(uploadId, {
    uploadId,
    projectSlug,
    status: 'uploading',
    bytesUploaded: 0,
    totalBytes: totalBytes,
    progress: 0,
    error: null,
    youtubeUrl: null,
    youtubeVideoId: null
  });

  // Real YouTube Data API v3 Resumable Upload
  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) {
    const errMsg = 'YouTube channel is not connected. Please connect your Google account in YouTube Studio Hub before uploading.';
    UploadLedger.update(uploadId, { status: 'failed', error_message: errMsg });
    throw new Error(errMsg);
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Prepare tags array
  const tagsArray = typeof tags === 'string'
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : tags;

  const resource = {
    snippet: {
      title: title.slice(0, 100), // YouTube title max 100 chars
      description: description || '',
      tags: tagsArray,
      categoryId: categoryId || '27',
      defaultLanguage: defaultLanguage || 'en'
    },
    status: {
      privacyStatus: privacyStatus || 'private', // NON-NEGOTIABLE SAFETY: default private
      selfDeclaredMadeForKids: false
    }
  };

  // If scheduled publication is set and privacy is private
  if (scheduledPublishTime && privacyStatus === 'private') {
    resource.status.publishAt = new Date(scheduledPublishTime).toISOString();
  }

  console.log(`[YouTube Upload] Starting upload of ${videoFilePath} to YouTube...`);

  // Asynchronous upload execution
  (async () => {
    try {
      const response = await youtube.videos.insert(
        {
          part: ['snippet', 'status'],
          requestBody: resource,
          media: {
            body: fs.createReadStream(videoFilePath)
          }
        },
        {
          onUploadProgress: (evt) => {
            const bytesUploaded = evt.bytesRead;
            const progress = Math.min(99, Math.round((bytesUploaded / totalBytes) * 100));
            activeUploads.set(uploadId, {
              uploadId,
              projectSlug,
              status: 'uploading',
              bytesUploaded,
              totalBytes,
              progress,
              error: null
            });
            UploadLedger.update(uploadId, { bytes_uploaded: bytesUploaded });
          }
        }
      );

      const videoId = response.data.id;
      const videoUrl = `https://youtu.be/${videoId}`;

      // Upload custom thumbnail if provided
      if (thumbnailPath && fs.existsSync(thumbnailPath)) {
        try {
          console.log(`[YouTube Upload] Setting custom thumbnail from ${thumbnailPath}...`);
          await youtube.thumbnails.set({
            videoId: videoId,
            media: {
              body: fs.createReadStream(thumbnailPath)
            }
          });
        } catch (thumbErr) {
          console.warn('[YouTube Upload] Thumbnail set warning:', thumbErr.message);
        }
      }

      const finalStatus = scheduledPublishTime ? 'scheduled' : 'success';

      activeUploads.set(uploadId, {
        uploadId,
        projectSlug,
        status: finalStatus,
        bytesUploaded: totalBytes,
        totalBytes,
        progress: 100,
        youtubeVideoId: videoId,
        youtubeUrl: videoUrl,
        error: null
      });

      UploadLedger.update(uploadId, {
        youtube_video_id: videoId,
        youtube_url: videoUrl,
        status: finalStatus,
        bytes_uploaded: totalBytes,
        scheduled_publish_time: scheduledPublishTime || null,
        scheduling_timezone: timezone || 'Asia/Kolkata',
        scheduling_confirmed_at: scheduledPublishTime ? new Date().toISOString() : null
      });

      ProjectMeta.save(projectSlug, {
        youtube_video_id: videoId,
        youtube_url: videoUrl,
        scheduled_publish_time: scheduledPublishTime || null,
        scheduling_timezone: timezone || 'Asia/Kolkata',
        youtube_status: finalStatus
      });

      ActivityLog.add(
        'YOUTUBE_UPLOAD',
        projectSlug,
        scheduledPublishTime ? `Video Scheduled for YouTube Release (${timezone})` : `Video Uploaded to YouTube (${privacyStatus.toUpperCase()})`,
        scheduledPublishTime ? `Scheduled for: ${scheduledPublishTime}` : `Video URL: ${videoUrl}`
      );

      console.log(`[YouTube Upload] Success! Video ID: ${videoId} (${videoUrl}) [Status: ${finalStatus}]`);
    } catch (uploadError) {
      console.error('[YouTube Upload Error]:', uploadError.message);
      const errMsg = uploadError.message || 'YouTube upload failed';
      activeUploads.set(uploadId, {
        uploadId,
        projectSlug,
        status: 'failed',
        error: errMsg,
        progress: 0
      });
      UploadLedger.update(uploadId, {
        status: 'failed',
        error_message: errMsg
      });
      ActivityLog.add(
        'YOUTUBE_UPLOAD_FAILED',
        projectSlug,
        'YouTube Upload Failed',
        errMsg
      );
    }
  })();

  return {
    uploadId,
    message: 'Upload started'
  };
}

function getUploadProgress(uploadId) {
  if (activeUploads.has(uploadId)) {
    return activeUploads.get(uploadId);
  }
  const dbRecord = UploadLedger.get(uploadId);
  if (dbRecord) {
    const progress = dbRecord.total_bytes > 0
      ? Math.round((dbRecord.bytes_uploaded / dbRecord.total_bytes) * 100)
      : (dbRecord.status === 'success' || dbRecord.status === 'scheduled' ? 100 : 0);
    return {
      uploadId: dbRecord.id,
      projectSlug: dbRecord.project_slug,
      status: dbRecord.status,
      bytesUploaded: dbRecord.bytes_uploaded,
      totalBytes: dbRecord.total_bytes,
      progress,
      youtubeVideoId: dbRecord.youtube_video_id,
      youtubeUrl: dbRecord.youtube_url,
      scheduledPublishTime: dbRecord.scheduled_publish_time,
      schedulingTimezone: dbRecord.scheduling_timezone,
      error: dbRecord.error_message
    };
  }
  return null;
}

/**
 * Schedules an existing private YouTube video for automatic future publication.
 * Uses the official YouTube Data API v3 (status.publishAt with privacyStatus: private).
 * Carefully preserves all existing snippet properties (title, description, tags, etc.)
 */
async function scheduleExistingVideo({ projectSlug, videoId, scheduledPublishTime, timezone = 'Asia/Kolkata', port = 4242 }) {
  if (!scheduledPublishTime) {
    throw new Error('A future publication date and time is required for scheduling.');
  }

  const pubDate = new Date(scheduledPublishTime);
  if (isNaN(pubDate.getTime()) || pubDate.getTime() <= Date.now()) {
    throw new Error('Publication time must be in the future.');
  }

  const isoPublishAt = pubDate.toISOString();

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) {
    throw new Error('YouTube channel is not connected. Please authorize your channel in YouTube Studio Hub first.');
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // 1. Fetch current video resource to preserve existing snippet
  const videoRes = await youtube.videos.list({
    part: ['snippet', 'status'],
    id: [videoId]
  });

  if (!videoRes.data.items || videoRes.data.items.length === 0) {
    throw new Error(`YouTube video ID "${videoId}" not found on channel.`);
  }

  const currentVideo = videoRes.data.items[0];
  const currentSnippet = currentVideo.snippet;

  // Invariant: Cannot schedule already-public video
  if (currentVideo.status.privacyStatus === 'public') {
    throw new Error('This video is already public. YouTube does not allow retroactive scheduling of public videos.');
  }

  // 2. Update with scheduled release
  const updateRes = await youtube.videos.update({
    part: ['snippet', 'status'],
    requestBody: {
      id: videoId,
      snippet: {
        title: currentSnippet.title,
        description: currentSnippet.description,
        tags: currentSnippet.tags,
        categoryId: currentSnippet.categoryId,
        defaultLanguage: currentSnippet.defaultLanguage
      },
      status: {
        privacyStatus: 'private',
        publishAt: isoPublishAt,
        selfDeclaredMadeForKids: false
      }
    }
  });

  const confirmedPublishAt = updateRes.data.status?.publishAt || isoPublishAt;

  // 3. Persist confirmed schedule to SQLite
  ProjectMeta.save(projectSlug, {
    scheduled_publish_time: confirmedPublishAt,
    scheduling_timezone: timezone,
    youtube_status: 'scheduled'
  });

  const existingUploads = UploadLedger.getByProject(projectSlug);
  if (existingUploads.length > 0) {
    UploadLedger.update(existingUploads[0].id, {
      status: 'scheduled',
      scheduled_publish_time: confirmedPublishAt,
      scheduling_timezone: timezone,
      scheduling_confirmed_at: new Date().toISOString()
    });
  }

  ActivityLog.add(
    'YOUTUBE_SCHEDULED',
    projectSlug,
    'Video Publication Scheduled on YouTube',
    `Confirmed by YouTube for release at ${confirmedPublishAt} (${timezone})`
  );

  return {
    success: true,
    videoId,
    publishAt: confirmedPublishAt,
    timezone,
    status: 'scheduled'
  };
}

/**
 * Cancels a scheduled publication on YouTube, returning video to standard private status.
 */
async function cancelScheduledVideo({ projectSlug, videoId, port = 4242 }) {
  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) {
    throw new Error('YouTube channel is not connected. Please connect in YouTube Studio Hub.');
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const videoRes = await youtube.videos.list({
    part: ['snippet', 'status'],
    id: [videoId]
  });

  if (!videoRes.data.items || videoRes.data.items.length === 0) {
    throw new Error(`YouTube video ID "${videoId}" not found.`);
  }

  const currentVideo = videoRes.data.items[0];
  const currentSnippet = currentVideo.snippet;

  // Clear publishAt and enforce private
  await youtube.videos.update({
    part: ['snippet', 'status'],
    requestBody: {
      id: videoId,
      snippet: {
        title: currentSnippet.title,
        description: currentSnippet.description,
        tags: currentSnippet.tags,
        categoryId: currentSnippet.categoryId,
        defaultLanguage: currentSnippet.defaultLanguage
      },
      status: {
        privacyStatus: 'private',
        publishAt: null,
        selfDeclaredMadeForKids: false
      }
    }
  });

  ProjectMeta.save(projectSlug, {
    scheduled_publish_time: null,
    youtube_status: 'private'
  });

  const existingUploads = UploadLedger.getByProject(projectSlug);
  if (existingUploads.length > 0) {
    UploadLedger.update(existingUploads[0].id, {
      status: 'success',
      scheduled_publish_time: null,
      scheduling_confirmed_at: null
    });
  }

  ActivityLog.add(
    'YOUTUBE_SCHEDULE_CANCELLED',
    projectSlug,
    'Scheduled Release Cancelled on YouTube',
    'Reverted video to private status'
  );

  return { success: true, message: 'Scheduled release cancelled. Video reverted to private.' };
}

/**
 * Returns list of upcoming scheduled releases across all projects.
 */
async function getScheduleList(port = 4242) {
  const { scanAllProjects } = require('./scanner');
  const projects = scanAllProjects();
  const scheduledItems = [];

  for (const p of projects) {
    const meta = p.metadata || {};
    const latestUpload = p.latestUpload;
    const scheduledTime = meta.scheduledPublishTime || latestUpload?.scheduledPublishTime;

    if (scheduledTime) {
      const pubDate = new Date(scheduledTime);
      const isPast = pubDate.getTime() <= Date.now();
      scheduledItems.push({
        projectSlug: p.slug,
        title: meta.youtubeTitle || p.title,
        thumbnail: p.contactSheetPath ? `/api/media/contact-sheet/${p.slug}` : null,
        scheduledPublishTime: scheduledTime,
        schedulingTimezone: meta.schedulingTimezone || 'Asia/Kolkata',
        youtubeVideoId: meta.youtubeVideoId,
        youtubeUrl: meta.youtubeUrl,
        status: isPast ? 'published' : 'scheduled',
        hasRenderedVideo: p.hasRenderedVideo,
        duration: p.videoStream?.duration || 0,
        confirmedAt: latestUpload?.scheduling_confirmed_at || null
      });
    }
  }

  // Sort upcoming chronologically
  scheduledItems.sort((a, b) => new Date(a.scheduledPublishTime) - new Date(b.scheduledPublishTime));

  return scheduledItems;
}

const { syncChannelVideos, parseIsoDuration } = require('./youtube_sync');
const { 
  getGrantedPermissions,
  updateVideoVisibility, 
  updateVideoMetadata, 
  updateVideoThumbnail,
  syncPlaylists,
  createPlaylist,
  getPlaylistVideos,
  addVideoToPlaylist,
  removeVideoFromPlaylist
} = require('./youtube_manage');
const { getChannelAnalytics, getVideoAnalytics, exportAnalyticsCSV } = require('./youtube_analytics');
const { getChannelComments, replyToComment, moderateComment, listVideoCaptions } = require('./youtube_comments');

module.exports = {
  SCOPES,
  getRedirectUri,
  getOAuthClient,
  getAuthUrl,
  handleOAuthCallback,
  getChannelProfile,
  uploadVideo,
  getUploadProgress,
  scheduleExistingVideo,
  cancelScheduledVideo,
  getScheduleList,
  syncChannelVideos,
  parseIsoDuration,
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
};
