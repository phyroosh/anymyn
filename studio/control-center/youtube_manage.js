const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { 
  YouTubeAuth, 
  YouTubeVideos, 
  YouTubeAuditLog, 
  YouTubePlaylists, 
  YouTubePlaylistItems,
  ProjectMeta, 
  ActivityLog 
} = require('./db');
const { getOAuthClient, getAuthUrl } = require('./youtube_client');

/**
 * Checks currently granted scopes for the authorized account.
 */
function getGrantedPermissions() {
  const authRecord = YouTubeAuth.get();
  if (!authRecord || !authRecord.access_token) {
    return {
      connected: false,
      canUpload: false,
      canRead: false,
      canManage: false,
      canAnalytics: false,
      grantedScopes: []
    };
  }

  const granted = (authRecord.scope || '').split(' ').filter(Boolean);
  return {
    connected: true,
    channelId: authRecord.channel_id,
    channelTitle: authRecord.channel_title,
    canUpload: granted.some(s => s.includes('youtube.upload') || s === 'https://www.googleapis.com/auth/youtube'),
    canRead: granted.some(s => s.includes('youtube.readonly') || s === 'https://www.googleapis.com/auth/youtube' || s.includes('youtube.force-ssl')),
    canManage: granted.some(s => s.includes('youtube.force-ssl') || s === 'https://www.googleapis.com/auth/youtube'),
    canAnalytics: granted.some(s => s.includes('yt-analytics.readonly')),
    grantedScopes: granted
  };
}

/**
 * Updates video visibility on YouTube (private, unlisted, public).
 * Validates permitted transitions, handles scheduled publication interaction,
 * sends genuine API request, verifies resulting status, and records audit history.
 */
async function updateVideoVisibility({ videoId, privacyStatus, confirmPublic = false, port = 4242 }) {
  if (!videoId) throw new Error('Video ID is required');

  const normalizedPrivacy = (privacyStatus || '').toLowerCase();
  if (!['private', 'unlisted', 'public'].includes(normalizedPrivacy)) {
    throw new Error(`Invalid privacy status "${privacyStatus}". Must be "private", "unlisted", or "public".`);
  }

  // Explicit confirmation gate for Public
  if (normalizedPrivacy === 'public' && !confirmPublic) {
    return {
      requiresConfirmation: true,
      message: 'Anyone on the internet will be able to watch this video once YouTube applies this change. Please confirm to proceed.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) {
    throw new Error('YouTube channel is not connected.');
  }

  const permissions = getGrantedPermissions();
  if (!permissions.canManage) {
    const { getAuthUrl } = require('./youtube_client');
    const authRecord = YouTubeAuth.get();
    const authUrl = getAuthUrl(authRecord.client_id, authRecord.client_secret, port);
    return {
      requiresPermissionUpgrade: true,
      authUrl,
      message: 'Channel management permission (youtube.force-ssl) is required to change video visibility on YouTube. Please authorize permissions.'
    };
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // 1. Retrieve latest live state from YouTube API
  const listRes = await youtube.videos.list({
    part: ['snippet', 'status'],
    id: [videoId]
  });

  if (!listRes.data.items || listRes.data.items.length === 0) {
    throw new Error(`Video with ID "${videoId}" was not found on your YouTube channel.`);
  }

  const liveVideo = listRes.data.items[0];
  const previousStatus = liveVideo.status || {};
  const previousPrivacy = previousStatus.privacyStatus;
  const previousPublishAt = previousStatus.publishAt || null;

  // Handle scheduled publication interaction:
  // If video is scheduled and transitioning to public/unlisted/private, publishAt must be handled
  const updateBody = {
    id: videoId,
    status: {
      privacyStatus: normalizedPrivacy,
      selfDeclaredMadeForKids: previousStatus.selfDeclaredMadeForKids || false
    }
  };

  // If video was scheduled and now being published or made unlisted, clear publishAt
  if (previousPublishAt && normalizedPrivacy !== 'private') {
    updateBody.status.publishAt = null;
  }

  console.log(`[YouTube Visibility] Updating video ${videoId} from "${previousPrivacy}" to "${normalizedPrivacy}"...`);

  // 2. Execute genuine YouTube API update
  const updateRes = await youtube.videos.update({
    part: ['status'],
    requestBody: updateBody
  });

  // 3. Immediately verify the resulting state from YouTube
  const verifyRes = await youtube.videos.list({
    part: ['status', 'snippet'],
    id: [videoId]
  });

  const verifiedVideo = verifyRes.data.items?.[0];
  if (!verifiedVideo) {
    throw new Error(`Could not verify video status after update for video "${videoId}".`);
  }

  const verifiedStatus = verifiedVideo.status || {};
  if (verifiedStatus.privacyStatus !== normalizedPrivacy) {
    throw new Error(`YouTube verification failed: expected status "${normalizedPrivacy}" but got "${verifiedStatus.privacyStatus}".`);
  }

  // 4. Update local database
  YouTubeVideos.updatePrivacy(videoId, verifiedStatus.privacyStatus, verifiedStatus.publishAt || null);

  const localVideo = YouTubeVideos.get(videoId);
  if (localVideo?.local_project_slug) {
    ProjectMeta.save(localVideo.local_project_slug, {
      privacy_status: verifiedStatus.privacyStatus,
      youtube_status: verifiedStatus.publishAt ? 'scheduled' : verifiedStatus.privacyStatus,
      scheduled_publish_time: verifiedStatus.publishAt || null
    });
  }

  // 5. Record in audit history
  YouTubeAuditLog.add({
    videoId,
    operationType: 'VISIBILITY_CHANGE',
    previousState: { privacyStatus: previousPrivacy, publishAt: previousPublishAt },
    requestedState: { privacyStatus: normalizedPrivacy },
    resultingState: { privacyStatus: verifiedStatus.privacyStatus, publishAt: verifiedStatus.publishAt },
    status: 'SUCCESS',
    details: `Updated privacy status from ${previousPrivacy.toUpperCase()} to ${verifiedStatus.privacyStatus.toUpperCase()}`
  });

  ActivityLog.add(
    'YOUTUBE_VISIBILITY_UPDATED',
    localVideo?.local_project_slug || null,
    `Video Visibility Updated (${verifiedStatus.privacyStatus.toUpperCase()})`,
    `Video ID ${videoId} is now ${verifiedStatus.privacyStatus.toUpperCase()}`
  );

  return {
    success: true,
    videoId,
    privacyStatus: verifiedStatus.privacyStatus,
    publishAt: verifiedStatus.publishAt || null,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Updates video metadata on YouTube (Title, Description, Tags, Category, Language).
 * STRICT SAFETY REQUIREMENT: Preserves all existing mutable properties in snippet.
 * Never sends partial bodies that overwrite descriptions or tags.
 */
async function updateVideoMetadata({ videoId, title, description, tags, categoryId, defaultLanguage, port = 4242 }) {
  if (!videoId) throw new Error('Video ID is required');

  const permissions = getGrantedPermissions();
  if (!permissions.canManage) {
    const { getAuthUrl } = require('./youtube_client');
    const authRecord = YouTubeAuth.get();
    const authUrl = getAuthUrl(authRecord.client_id, authRecord.client_secret, port);
    return {
      requiresPermissionUpgrade: true,
      authUrl,
      message: 'Channel management permission (youtube.force-ssl) is required to edit video metadata on YouTube.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // 1. Fetch current live video resource to preserve mutable properties
  const liveRes = await youtube.videos.list({
    part: ['snippet'],
    id: [videoId]
  });

  if (!liveRes.data.items || liveRes.data.items.length === 0) {
    throw new Error(`Video with ID "${videoId}" not found on YouTube.`);
  }

  const currentSnippet = liveRes.data.items[0].snippet || {};

  // Validate inputs
  const finalTitle = title !== undefined ? String(title).trim().slice(0, 100) : currentSnippet.title;
  if (!finalTitle) throw new Error('Title cannot be empty');

  const finalDescription = description !== undefined ? String(description) : (currentSnippet.description || '');
  if (finalDescription.length > 5000) {
    throw new Error('Description exceeds YouTube 5,000 character limit.');
  }

  let finalTags = currentSnippet.tags || [];
  if (tags !== undefined) {
    finalTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : String(tags).split(',').map(t => t.trim()).filter(Boolean);
  }

  const finalCategory = categoryId !== undefined ? String(categoryId) : (currentSnippet.categoryId || '27');
  const finalLanguage = defaultLanguage !== undefined ? String(defaultLanguage) : (currentSnippet.defaultLanguage || 'en');

  // Build complete merged snippet, preserving all properties
  const mergedSnippet = {
    title: finalTitle,
    description: finalDescription,
    tags: finalTags,
    categoryId: finalCategory,
    defaultLanguage: finalLanguage
  };

  if (currentSnippet.defaultAudioLanguage) {
    mergedSnippet.defaultAudioLanguage = currentSnippet.defaultAudioLanguage;
  }

  console.log(`[YouTube Metadata] Updating snippet for video ${videoId} ("${finalTitle}")...`);

  // 2. Execute update
  await youtube.videos.update({
    part: ['snippet'],
    requestBody: {
      id: videoId,
      snippet: mergedSnippet
    }
  });

  // 3. Immediately verify the updated resource
  const verifyRes = await youtube.videos.list({
    part: ['snippet'],
    id: [videoId]
  });

  const verifiedSnippet = verifyRes.data.items?.[0]?.snippet;
  if (!verifiedSnippet) {
    throw new Error('Could not verify metadata after update.');
  }

  // 4. Update local database
  YouTubeVideos.updateMetadata(videoId, {
    title: verifiedSnippet.title,
    description: verifiedSnippet.description,
    tags: verifiedSnippet.tags || [],
    categoryId: verifiedSnippet.categoryId,
    defaultLanguage: verifiedSnippet.defaultLanguage
  });

  const localVideo = YouTubeVideos.get(videoId);
  if (localVideo?.local_project_slug) {
    ProjectMeta.save(localVideo.local_project_slug, {
      youtube_title: verifiedSnippet.title,
      youtube_description: verifiedSnippet.description,
      tags: (verifiedSnippet.tags || []).join(', '),
      category_id: verifiedSnippet.categoryId,
      default_language: verifiedSnippet.defaultLanguage
    });
  }

  // 5. Record audit log
  YouTubeAuditLog.add({
    videoId,
    operationType: 'METADATA_UPDATE',
    previousState: {
      title: currentSnippet.title,
      description: currentSnippet.description?.slice(0, 150) + '...',
      tags: currentSnippet.tags
    },
    requestedState: {
      title: finalTitle,
      description: finalDescription?.slice(0, 150) + '...',
      tags: finalTags
    },
    resultingState: {
      title: verifiedSnippet.title,
      tagsCount: verifiedSnippet.tags?.length || 0
    },
    status: 'SUCCESS',
    details: `Updated title to "${verifiedSnippet.title}" with ${verifiedSnippet.tags?.length || 0} tags`
  });

  ActivityLog.add(
    'YOUTUBE_METADATA_UPDATED',
    localVideo?.local_project_slug || null,
    'YouTube Metadata Updated',
    `Updated metadata for "${verifiedSnippet.title}" (${videoId})`
  );

  return {
    success: true,
    videoId,
    snippet: verifiedSnippet,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Replaces or uploads custom thumbnail for a video via YouTube thumbnails.set API.
 * Validates file size (max 2MB), formats (JPG, PNG, WebP), and processing status.
 */
async function updateVideoThumbnail({ videoId, filePath, port = 4242 }) {
  if (!videoId) throw new Error('Video ID is required');
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`Thumbnail image file not found at ${filePath}`);
  }

  const permissions = getGrantedPermissions();
  if (!permissions.canManage) {
    const { getAuthUrl } = require('./youtube_client');
    const authRecord = YouTubeAuth.get();
    const authUrl = getAuthUrl(authRecord.client_id, authRecord.client_secret, port);
    return {
      requiresPermissionUpgrade: true,
      authUrl,
      message: 'Channel management permission (youtube.force-ssl) is required to set custom thumbnails on YouTube.'
    };
  }

  const fileStats = fs.statSync(filePath);
  // YouTube strict custom thumbnail limit: 2MB (2,097,152 bytes)
  if (fileStats.size > 2 * 1024 * 1024) {
    throw new Error(`Thumbnail size (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB) exceeds YouTube's 2 MB limit.`);
  }

  const ext = path.extname(filePath).toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';
  else if (ext !== '.jpg' && ext !== '.jpeg') {
    throw new Error('Unsupported thumbnail format. Must be JPEG, PNG, or WebP.');
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Check upload processing status
  const videoRes = await youtube.videos.list({
    part: ['status', 'snippet'],
    id: [videoId]
  });

  if (!videoRes.data.items || videoRes.data.items.length === 0) {
    throw new Error(`Video with ID "${videoId}" not found on YouTube.`);
  }

  const currentVideo = videoRes.data.items[0];
  const uploadStatus = currentVideo.status?.uploadStatus;

  // Shorts requirement: wait until processed
  if (uploadStatus && uploadStatus !== 'processed') {
    console.warn(`[YouTube Thumbnail] Video ${videoId} upload status is "${uploadStatus}". YouTube may reject custom thumbnails until processing completes.`);
  }

  console.log(`[YouTube Thumbnail] Uploading custom thumbnail for video ${videoId} (${fileStats.size} bytes)...`);

  const setRes = await youtube.thumbnails.set({
    videoId: videoId,
    media: {
      mimeType: mimeType,
      body: fs.createReadStream(filePath)
    }
  });

  const updatedThumbnails = setRes.data.items?.[0] || {};
  const bestThumbUrl = updatedThumbnails.maxres?.url || updatedThumbnails.standard?.url || updatedThumbnails.high?.url || updatedThumbnails.medium?.url || updatedThumbnails.default?.url || null;

  // Update local DB
  YouTubeVideos.updateThumbnail(videoId, bestThumbUrl, updatedThumbnails);

  const localVideo = YouTubeVideos.get(videoId);
  if (localVideo?.local_project_slug) {
    ProjectMeta.save(localVideo.local_project_slug, {
      custom_thumbnail_path: filePath
    });
  }

  // Record audit log
  YouTubeAuditLog.add({
    videoId,
    operationType: 'THUMBNAIL_UPDATE',
    previousState: { thumbnail: currentVideo.snippet?.thumbnails?.default?.url },
    requestedState: { filePath, sizeBytes: fileStats.size },
    resultingState: { thumbnailUrl: bestThumbUrl },
    status: 'SUCCESS',
    details: `Replaced custom thumbnail for video ${videoId}`
  });

  ActivityLog.add(
    'YOUTUBE_THUMBNAIL_UPDATED',
    localVideo?.local_project_slug || null,
    'Custom Thumbnail Updated',
    `Updated custom thumbnail for video ${videoId}`
  );

  return {
    success: true,
    videoId,
    thumbnailUrl: bestThumbUrl,
    thumbnails: updatedThumbnails,
    verifiedAt: new Date().toISOString()
  };
}

// -------------------------------------------------------------
// PLAYLIST MANAGEMENT
// -------------------------------------------------------------

/**
 * Retrieves and synchronizes channel playlists.
 */
async function syncPlaylists({ port = 4242, force = false } = {}) {
  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const plRes = await youtube.playlists.list({
    part: ['snippet', 'contentDetails', 'status'],
    mine: true,
    maxResults: 50
  });

  const items = plRes.data.items || [];
  const syncedPlaylists = [];

  for (const item of items) {
    const s = item.snippet || {};
    const cd = item.contentDetails || {};
    const st = item.status || {};
    const thumb = s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url || null;

    const record = {
      playlist_id: item.id,
      channel_id: s.channelId,
      title: s.title || '',
      description: s.description || '',
      privacy_status: st.privacyStatus || 'public',
      item_count: parseInt(cd.itemCount || 0, 10),
      thumbnail_url: thumb,
      published_at: s.publishedAt || null,
      synced_at: new Date().toISOString()
    };

    YouTubePlaylists.upsert(record);
    syncedPlaylists.push(record);
  }

  return syncedPlaylists;
}

/**
 * Creates a new playlist on the channel.
 */
async function createPlaylist({ title, description = '', privacyStatus = 'public', port = 4242 }) {
  if (!title || !title.trim()) throw new Error('Playlist title is required');

  const permissions = getGrantedPermissions();
  if (!permissions.canManage) {
    const { getAuthUrl } = require('./youtube_client');
    const authRecord = YouTubeAuth.get();
    return {
      requiresPermissionUpgrade: true,
      authUrl: getAuthUrl(authRecord.client_id, authRecord.client_secret, port),
      message: 'Channel management permission (youtube.force-ssl) is required to create playlists.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const res = await youtube.playlists.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: title.trim(),
        description: description.trim()
      },
      status: {
        privacyStatus: privacyStatus || 'public'
      }
    }
  });

  const item = res.data;
  const s = item.snippet || {};
  const record = {
    playlist_id: item.id,
    channel_id: s.channelId,
    title: s.title,
    description: s.description,
    privacy_status: res.data.status?.privacyStatus || 'public',
    item_count: 0,
    thumbnail_url: null,
    published_at: s.publishedAt,
    synced_at: new Date().toISOString()
  };

  YouTubePlaylists.upsert(record);

  YouTubeAuditLog.add({
    operationType: 'PLAYLIST_CREATE',
    requestedState: { title, privacyStatus },
    resultingState: { playlistId: item.id, title },
    status: 'SUCCESS',
    details: `Created new playlist "${title}" (${item.id})`
  });

  return record;
}

/**
 * Fetches items belonging to a playlist.
 */
async function getPlaylistVideos({ playlistId, port = 4242 }) {
  if (!playlistId) throw new Error('Playlist ID is required');

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const res = await youtube.playlistItems.list({
    part: ['snippet', 'contentDetails', 'status'],
    playlistId,
    maxResults: 50
  });

  const items = res.data.items || [];
  YouTubePlaylistItems.clearPlaylist(playlistId);

  const playlistItems = [];
  for (const it of items) {
    const s = it.snippet || {};
    const videoId = it.contentDetails?.videoId || s.resourceId?.videoId;
    const thumb = s.thumbnails?.medium?.url || s.thumbnails?.default?.url || null;

    const itemRecord = {
      id: it.id,
      playlist_id: playlistId,
      video_id: videoId,
      title: s.title || '',
      description: s.description || '',
      thumbnail_url: thumb,
      position: s.position || 0,
      video_published_at: it.contentDetails?.videoPublishedAt || s.publishedAt || null,
      synced_at: new Date().toISOString()
    };

    YouTubePlaylistItems.upsert(itemRecord);
    playlistItems.push(itemRecord);
  }

  return playlistItems;
}

/**
 * Adds an existing channel video to a playlist.
 */
async function addVideoToPlaylist({ playlistId, videoId, position = null, port = 4242 }) {
  if (!playlistId || !videoId) throw new Error('Both playlistId and videoId are required');

  const permissions = getGrantedPermissions();
  if (!permissions.canManage) {
    const { getAuthUrl } = require('./youtube_client');
    const authRecord = YouTubeAuth.get();
    return {
      requiresPermissionUpgrade: true,
      authUrl: getAuthUrl(authRecord.client_id, authRecord.client_secret, port),
      message: 'Channel management permission is required to add videos to playlists.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const snippet = {
    playlistId,
    resourceId: {
      kind: 'youtube#video',
      videoId
    }
  };
  if (position !== null && !isNaN(position)) {
    snippet.position = parseInt(position, 10);
  }

  const res = await youtube.playlistItems.insert({
    part: ['snippet'],
    requestBody: { snippet }
  });

  const item = res.data;
  const s = item.snippet || {};

  const record = {
    id: item.id,
    playlist_id: playlistId,
    video_id: videoId,
    title: s.title || '',
    description: s.description || '',
    thumbnail_url: s.thumbnails?.medium?.url || null,
    position: s.position || 0,
    video_published_at: new Date().toISOString(),
    synced_at: new Date().toISOString()
  };

  YouTubePlaylistItems.upsert(record);

  YouTubeAuditLog.add({
    videoId,
    operationType: 'PLAYLIST_ADD_VIDEO',
    requestedState: { playlistId, videoId },
    resultingState: { playlistItemId: item.id },
    status: 'SUCCESS',
    details: `Added video ${videoId} to playlist ${playlistId}`
  });

  return record;
}

/**
 * Removes a video from a playlist.
 * Invariant: Does NOT delete the underlying video from the channel!
 */
async function removeVideoFromPlaylist({ playlistItemId, playlistId, videoId, port = 4242 }) {
  if (!playlistItemId) throw new Error('Playlist item ID is required');

  const permissions = getGrantedPermissions();
  if (!permissions.canManage) {
    const { getAuthUrl } = require('./youtube_client');
    const authRecord = YouTubeAuth.get();
    return {
      requiresPermissionUpgrade: true,
      authUrl: getAuthUrl(authRecord.client_id, authRecord.client_secret, port),
      message: 'Channel management permission is required to remove videos from playlists.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  await youtube.playlistItems.delete({
    id: playlistItemId
  });

  YouTubePlaylistItems.delete(playlistItemId);

  YouTubeAuditLog.add({
    videoId: videoId || null,
    operationType: 'PLAYLIST_REMOVE_VIDEO',
    requestedState: { playlistItemId, playlistId },
    resultingState: { removed: true },
    status: 'SUCCESS',
    details: `Removed entry ${playlistItemId} from playlist ${playlistId} (Video remains safe on channel)`
  });

  return { success: true, message: 'Video removed from playlist (channel video preserved)' };
}

module.exports = {
  getGrantedPermissions,
  updateVideoVisibility,
  updateVideoMetadata,
  updateVideoThumbnail,
  syncPlaylists,
  createPlaylist,
  getPlaylistVideos,
  addVideoToPlaylist,
  removeVideoFromPlaylist
};
