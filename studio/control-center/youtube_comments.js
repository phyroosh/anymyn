const { google } = require('googleapis');
const { YouTubeAuth, YouTubeAuditLog, ActivityLog } = require('./db');
const { getOAuthClient, getAuthUrl } = require('./youtube_client');
const { getGrantedPermissions } = require('./youtube_manage');

/**
 * Retrieves comment threads for the channel.
 */
async function getChannelComments({ videoId = null, moderationStatus = 'published', maxResults = 50, port = 4242 } = {}) {
  const permissions = getGrantedPermissions();
  const authRecord = YouTubeAuth.get();

  if (!permissions.canManage) {
    return {
      success: true,
      count: 0,
      threads: [],
      requiresPermissionUpgrade: true,
      authUrl: getAuthUrl(authRecord?.client_id, authRecord?.client_secret, port),
      message: 'Viewing and moderating channel comments requires channel management permission (youtube.force-ssl). Click Connect to upgrade permissions.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const channelId = authRecord?.channel_id;
  if (!channelId) throw new Error('Channel ID not found.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const params = {
    part: ['snippet', 'replies'],
    maxResults: Math.min(50, maxResults)
  };

  if (videoId) {
    params.videoId = videoId;
  } else {
    params.allThreadsRelatedToChannelId = channelId;
  }

  if (moderationStatus && moderationStatus !== 'published') {
    // heldForReview requires management permission (force-ssl)
    if (!permissions.canManage) {
      return {
        requiresPermissionUpgrade: true,
        message: 'Moderating held-for-review comments requires channel management permission (youtube.force-ssl).'
      };
    }
    params.moderationStatus = moderationStatus; // 'heldForReview' | 'likelySpam'
  }

  try {
    const res = await youtube.commentThreads.list(params);
    const threads = (res.data.items || []).map(item => {
      const topComment = item.snippet?.topLevelComment?.snippet || {};
      const replies = (item.replies?.comments || []).map(r => ({
        id: r.id,
        authorDisplayName: r.snippet?.authorDisplayName,
        authorProfileImageUrl: r.snippet?.authorProfileImageUrl,
        textDisplay: r.snippet?.textDisplay,
        publishedAt: r.snippet?.publishedAt,
        likeCount: r.snippet?.likeCount || 0
      }));

      return {
        id: item.id,
        videoId: item.snippet?.videoId,
        totalReplyCount: item.snippet?.totalReplyCount || 0,
        isPublic: item.snippet?.isPublic,
        authorDisplayName: topComment.authorDisplayName,
        authorProfileImageUrl: topComment.authorProfileImageUrl,
        authorChannelUrl: topComment.authorChannelUrl,
        textDisplay: topComment.textDisplay,
        publishedAt: topComment.publishedAt,
        likeCount: topComment.likeCount || 0,
        viewerRating: topComment.viewerRating,
        replies
      };
    });

    return {
      success: true,
      count: threads.length,
      threads,
      moderationStatus
    };
  } catch (err) {
    console.warn('[YouTube Comments Error]:', err.message);
    if (err.message && (err.message.includes('Insufficient Permission') || err.message.includes('insufficient_scope'))) {
      return {
        success: true,
        count: 0,
        threads: [],
        requiresPermissionUpgrade: true,
        authUrl: getAuthUrl(authRecord?.client_id, authRecord?.client_secret, port),
        message: 'Viewing and moderating channel comments requires channel management permission (youtube.force-ssl). Click Connect to upgrade permissions.'
      };
    }
    // Comments may be disabled on private videos or channel
    if (err.message.includes('commentsDisabled')) {
      return {
        success: true,
        count: 0,
        threads: [],
        note: 'Comments are currently disabled for this video/channel.'
      };
    }
    throw err;
  }
}

/**
 * Replies to a comment thread.
 */
async function replyToComment({ parentId, text, port = 4242 }) {
  if (!parentId || !text || !text.trim()) {
    throw new Error('Comment parentId and non-empty reply text are required.');
  }

  const permissions = getGrantedPermissions();
  if (!permissions.canManage) {
    const { getAuthUrl } = require('./youtube_client');
    const authRecord = YouTubeAuth.get();
    return {
      requiresPermissionUpgrade: true,
      authUrl: getAuthUrl(authRecord?.client_id, authRecord?.client_secret, port),
      message: 'Channel management permission is required to reply to comments.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const res = await youtube.comments.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        parentId,
        textOriginal: text.trim()
      }
    }
  });

  const comment = res.data;
  YouTubeAuditLog.add({
    operationType: 'COMMENT_REPLY',
    requestedState: { parentId, text: text.trim() },
    resultingState: { commentId: comment.id },
    status: 'SUCCESS',
    details: `Replied to comment thread ${parentId}`
  });

  return {
    success: true,
    commentId: comment.id,
    publishedAt: comment.snippet?.publishedAt
  };
}

/**
 * Sets moderation status for comments (published or rejected, optional banAuthor).
 */
async function moderateComment({ commentId, moderationStatus, banAuthor = false, port = 4242 }) {
  if (!commentId) throw new Error('Comment ID is required');
  if (!['published', 'rejected'].includes(moderationStatus)) {
    throw new Error('moderationStatus must be "published" or "rejected".');
  }

  const permissions = getGrantedPermissions();
  if (!permissions.canManage) {
    throw new Error('Channel management permission is required to moderate comments.');
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  await youtube.comments.setModerationStatus({
    id: [commentId],
    moderationStatus,
    banAuthor: !!banAuthor
  });

  YouTubeAuditLog.add({
    operationType: 'COMMENT_MODERATE',
    requestedState: { commentId, moderationStatus, banAuthor: !!banAuthor },
    status: 'SUCCESS',
    details: `Set moderation status of comment ${commentId} to ${moderationStatus}${banAuthor ? ' (Author banned)' : ''}`
  });

  return {
    success: true,
    commentId,
    moderationStatus,
    banAuthor: !!banAuthor
  };
}

/**
 * Lists caption tracks for a video.
 */
async function listVideoCaptions({ videoId, port = 4242 }) {
  if (!videoId) throw new Error('Video ID is required');

  const permissions = getGrantedPermissions();
  if (!permissions.canManage && !permissions.canRead) {
    throw new Error('Permission required to access caption tracks.');
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  try {
    const res = await youtube.captions.list({
      part: ['snippet'],
      videoId
    });

    const items = (res.data.items || []).map(c => ({
      id: c.id,
      language: c.snippet?.language,
      name: c.snippet?.name,
      trackKind: c.snippet?.trackKind,
      isDraft: c.snippet?.isDraft,
      isAutoSynced: c.snippet?.isAutoSynced,
      status: c.snippet?.status,
      lastUpdated: c.snippet?.lastUpdated
    }));

    return {
      success: true,
      videoId,
      captions: items
    };
  } catch (err) {
    console.warn(`[YouTube Captions Error for ${videoId}]:`, err.message);
    const isPermission = err.message && (err.message.includes('Insufficient Permission') || err.message.includes('insufficient_scope'));
    return {
      success: false,
      videoId,
      captions: [],
      requiresPermissionUpgrade: isPermission,
      error: isPermission ? 'Viewing captions requires channel management permission (youtube.force-ssl).' : err.message
    };
  }
}

module.exports = {
  getChannelComments,
  replyToComment,
  moderateComment,
  listVideoCaptions
};
