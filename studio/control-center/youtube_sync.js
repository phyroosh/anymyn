const { google } = require('googleapis');
const { 
  YouTubeAuth, 
  YouTubeVideos, 
  YouTubeSyncState, 
  YouTubeAuditLog, 
  ProjectMeta, 
  UploadLedger,
  ActivityLog 
} = require('./db');
const { getOAuthClient } = require('./youtube_client');

// Parse ISO 8601 duration format (e.g. PT53S, PT1M30S, PT1H2M3S) into seconds
function parseIsoDuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// In-memory sync lock to avoid parallel duplicate calls
let isSyncing = false;
let currentSyncPromise = null;

/**
 * Synchronizes all videos from the authenticated YouTube channel into local SQLite database.
 * @param {Object} options
 * @param {boolean} options.force - Force bypass 3-minute throttle cache
 * @param {number} options.port - Control center port
 */
async function syncChannelVideos({ force = false, port = 4242 } = {}) {
  // If sync already running, return active promise
  if (isSyncing && currentSyncPromise) {
    return currentSyncPromise;
  }

  // Throttle check: avoid burning API quota if synced recently (within 3 minutes)
  const syncState = YouTubeSyncState.get();
  if (!force && syncState && syncState.last_synced_at) {
    const elapsedMs = Date.now() - new Date(syncState.last_synced_at).getTime();
    if (elapsedMs < 3 * 60 * 1000) {
      console.log(`[YouTube Sync] Using cached sync from ${(elapsedMs / 1000).toFixed(0)}s ago.`);
      return {
        cached: true,
        channel: syncState,
        syncedVideos: syncState.total_videos_synced || 0,
        lastSyncedAt: syncState.last_synced_at
      };
    }
  }

  isSyncing = true;
  currentSyncPromise = (async () => {
    const oauth2Client = getOAuthClient(port);
    if (!oauth2Client) {
      throw new Error('YouTube channel is not connected. Authorize your Google account first.');
    }

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const nowIso = new Date().toISOString();

    try {
      console.log('[YouTube Sync] Starting channel discovery & video synchronization...');
      YouTubeSyncState.set({ status: 'syncing', error_message: null });

      // 1. Discover authenticated channel identity and uploads playlist
      const chRes = await youtube.channels.list({
        part: ['snippet', 'contentDetails', 'statistics', 'brandingSettings'],
        mine: true
      });

      if (!chRes.data.items || chRes.data.items.length === 0) {
        throw new Error('No YouTube channel found for the authenticated account.');
      }

      const channelItem = chRes.data.items[0];
      const channelId = channelItem.id;
      const snippet = channelItem.snippet || {};
      const statistics = channelItem.statistics || {};
      const relatedPlaylists = channelItem.contentDetails?.relatedPlaylists || {};
      const uploadsPlaylistId = relatedPlaylists.uploads;

      if (!uploadsPlaylistId) {
        throw new Error(`Uploads playlist not found for channel "${snippet.title}".`);
      }

      const channelInfo = {
        channel_id: channelId,
        channel_title: snippet.title || 'Connected Channel',
        channel_custom_url: snippet.customUrl || null,
        channel_thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || null,
        channel_banner: channelItem.brandingSettings?.image?.bannerExternalUrl || null,
        subscriber_count: statistics.hiddenSubscriberCount ? 'Hidden' : (statistics.subscriberCount || '0'),
        total_views: statistics.viewCount || '0',
        total_videos: parseInt(statistics.videoCount || 0, 10)
      };

      // Update YouTubeAuth channel info
      YouTubeAuth.saveTokens({}, {
        id: channelId,
        title: channelInfo.channel_title,
        thumbnail: channelInfo.channel_thumbnail
      });

      // 2. Paginate through the uploads playlist to collect all video IDs
      const playlistVideoEntries = [];
      let nextPageToken = null;
      let pageCount = 0;

      do {
        pageCount++;
        const plRes = await youtube.playlistItems.list({
          playlistId: uploadsPlaylistId,
          part: ['snippet', 'contentDetails', 'status'],
          maxResults: 50,
          pageToken: nextPageToken || undefined
        });

        const items = plRes.data.items || [];
        for (const item of items) {
          const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
          if (videoId) {
            playlistVideoEntries.push({
              videoId,
              playlistItemId: item.id,
              position: item.snippet?.position,
              videoPublishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt
            });
          }
        }

        nextPageToken = plRes.data.nextPageToken;
      } while (nextPageToken && pageCount < 20); // Safety limit 1,000 videos

      console.log(`[YouTube Sync] Found ${playlistVideoEntries.length} videos in uploads playlist.`);

      // 3. Batch query videos.list (up to 50 videos per call)
      const allSyncedVideos = [];
      const batchSize = 50;

      // Build local project lookup maps for linking
      const allProjects = ProjectMeta.getAll();
      const allUploads = UploadLedger.getAll();

      const videoIdToSlugMap = new Map();
      for (const p of allProjects) {
        if (p.youtube_video_id) videoIdToSlugMap.set(p.youtube_video_id, p.slug);
      }
      for (const u of allUploads) {
        if (u.youtube_video_id && u.project_slug) videoIdToSlugMap.set(u.youtube_video_id, u.project_slug);
      }

      for (let i = 0; i < playlistVideoEntries.length; i += batchSize) {
        const batch = playlistVideoEntries.slice(i, i + batchSize);
        const batchIds = batch.map(b => b.videoId);

        const vRes = await youtube.videos.list({
          part: ['snippet', 'contentDetails', 'status', 'statistics', 'liveStreamingDetails'],
          id: batchIds
        });

        const videoItems = vRes.data.items || [];

        for (const item of videoItems) {
          const vSnippet = item.snippet || {};
          const vStatus = item.status || {};
          const vDetails = item.contentDetails || {};
          const vStats = item.statistics || {};

          // Choose highest resolution available thumbnail
          const thumbObj = vSnippet.thumbnails || {};
          const bestThumb = thumbObj.maxres?.url || thumbObj.standard?.url || thumbObj.high?.url || thumbObj.medium?.url || thumbObj.default?.url || null;

          const durationSeconds = parseIsoDuration(vDetails.duration);

          // Check if linked to an ANYMYN local project
          const localSlug = videoIdToSlugMap.get(item.id) || null;
          const isChannelOnly = !localSlug;

          const videoRecord = {
            video_id: item.id,
            channel_id: vSnippet.channelId || channelId,
            title: vSnippet.title || '',
            description: vSnippet.description || '',
            tags: vSnippet.tags || [],
            category_id: vSnippet.categoryId || '27',
            default_language: vSnippet.defaultLanguage || 'en',
            default_audio_language: vSnippet.defaultAudioLanguage || null,
            published_at: vSnippet.publishedAt || null,
            thumbnail_url: bestThumb,
            thumbnails_json: thumbObj,
            duration: vDetails.duration || null,
            duration_seconds: durationSeconds,
            dimension: vDetails.dimension || '2d',
            definition: vDetails.definition || 'hd',
            caption: vDetails.caption || 'false',
            licensed_content: vDetails.licensedContent ? 1 : 0,
            privacy_status: vStatus.privacyStatus || 'private',
            upload_status: vStatus.uploadStatus || 'processed',
            publish_at: vStatus.publishAt || null, // Scheduled release date if any
            view_count: parseInt(vStats.viewCount || 0, 10),
            like_count: parseInt(vStats.likeCount || 0, 10),
            comment_count: parseInt(vStats.commentCount || 0, 10),
            local_project_slug: localSlug,
            is_channel_only: isChannelOnly ? 1 : 0,
            is_deleted: 0,
            etag: item.etag,
            synced_at: nowIso
          };

          YouTubeVideos.upsert(videoRecord);
          allSyncedVideos.push(videoRecord);

          // If linked to local project, update local project state to match verified YouTube state
          if (localSlug) {
            ProjectMeta.save(localSlug, {
              youtube_title: videoRecord.title,
              youtube_description: videoRecord.description,
              privacy_status: videoRecord.privacy_status,
              youtube_status: videoRecord.publish_at ? 'scheduled' : videoRecord.privacy_status,
              scheduled_publish_time: videoRecord.publish_at || null,
              youtube_published_at: videoRecord.published_at
            });
          }
        }
      }

      // 4. Mark videos no longer in uploads as deleted/inaccessible
      const syncedIds = new Set(playlistVideoEntries.map(e => e.videoId));
      const existingVideos = YouTubeVideos.getAll({ limit: 1000 });
      for (const ex of existingVideos) {
        if (!syncedIds.has(ex.video_id)) {
          YouTubeVideos.markDeleted(ex.video_id);
        }
      }

      // 5. Update global sync state
      const updatedSyncState = YouTubeSyncState.set({
        channel_id: channelInfo.channel_id,
        channel_title: channelInfo.channel_title,
        channel_custom_url: channelInfo.channel_custom_url,
        channel_thumbnail: channelInfo.channel_thumbnail,
        subscriber_count: channelInfo.subscriber_count,
        total_views: channelInfo.total_views,
        total_videos: channelInfo.total_videos,
        last_synced_at: nowIso,
        total_videos_synced: allSyncedVideos.length,
        status: 'idle',
        error_message: null
      });

      YouTubeAuditLog.add({
        operationType: 'CHANNEL_SYNC',
        resultingState: {
          channelId: channelInfo.channel_id,
          syncedVideosCount: allSyncedVideos.length,
          lastSyncedAt: nowIso
        },
        status: 'SUCCESS',
        details: `Synced ${allSyncedVideos.length} YouTube videos from channel "${channelInfo.channel_title}"`
      });

      ActivityLog.add(
        'YOUTUBE_SYNC_SUCCESS',
        null,
        'YouTube Channel Synchronized',
        `Synchronized ${allSyncedVideos.length} videos from ${channelInfo.channel_title}`
      );

      console.log(`[YouTube Sync] Channel synchronization complete. (${allSyncedVideos.length} videos)`);

      return {
        success: true,
        channel: updatedSyncState,
        syncedVideos: allSyncedVideos.length,
        lastSyncedAt: nowIso
      };

    } catch (syncErr) {
      console.error('[YouTube Sync Error]:', syncErr.message);
      YouTubeSyncState.set({
        status: 'error',
        error_message: syncErr.message
      });

      YouTubeAuditLog.add({
        operationType: 'CHANNEL_SYNC',
        status: 'FAILED',
        errorMessage: syncErr.message,
        details: 'Channel video synchronization encountered an error'
      });

      throw syncErr;
    } finally {
      isSyncing = false;
      currentSyncPromise = null;
    }
  })();

  return currentSyncPromise;
}

module.exports = {
  syncChannelVideos,
  parseIsoDuration
};
