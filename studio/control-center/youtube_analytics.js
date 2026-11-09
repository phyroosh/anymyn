const { google } = require('googleapis');
const { YouTubeAuth, YouTubeVideos } = require('./db');
const { getOAuthClient, getAuthUrl } = require('./youtube_client');
const { getGrantedPermissions } = require('./youtube_manage');

/**
 * Calculates start and end date strings (YYYY-MM-DD) for analytics queries.
 */
function getDateRange(range = '28d') {
  const end = new Date();
  end.setDate(end.getDate() - 1); // YouTube analytics has ~1-2 day lag for finalized data
  const start = new Date(end);

  if (range === '7d') {
    start.setDate(end.getDate() - 6);
  } else if (range === '28d') {
    start.setDate(end.getDate() - 27);
  } else if (range === '90d') {
    start.setDate(end.getDate() - 89);
  } else if (range === '365d') {
    start.setDate(end.getDate() - 364);
  } else if (range === 'lifetime') {
    start.setFullYear(2020, 0, 1);
  } else {
    start.setDate(end.getDate() - 27);
  }

  const fmt = (d) => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

/**
 * Queries official YouTube Analytics API for channel-level metrics and daily time-series.
 */
async function getChannelAnalytics({ range = '28d', port = 4242 } = {}) {
  const permissions = getGrantedPermissions();
  if (!permissions.canAnalytics) {
    const { getAuthUrl } = require('./youtube_client');
    const authRecord = YouTubeAuth.get();
    return {
      available: false,
      requiresPermissionUpgrade: true,
      authUrl: getAuthUrl(authRecord?.client_id, authRecord?.client_secret, port),
      message: 'YouTube Analytics permission (yt-analytics.readonly) is required to view performance reports. Click Connect Analytics to authorize.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const ytAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });
  const { startDate, endDate } = getDateRange(range);

  try {
    // 1. Channel summary totals
    const summaryRes = await ytAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,comments,shares'
    });

    // 2. Day-by-day time series
    const dailyRes = await ytAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,likes',
      dimensions: 'day',
      sort: 'day'
    });

    // 3. Per-video performance breakdown
    const videoRes = await ytAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,comments',
      dimensions: 'video',
      maxResults: 25,
      sort: '-views'
    });

    // Format summary headers & row
    const summaryHeaders = summaryRes.data.columnHeaders?.map(c => c.name) || [];
    const summaryRow = summaryRes.data.rows?.[0] || [];
    const totals = {};
    summaryHeaders.forEach((h, idx) => {
      totals[h] = summaryRow[idx] !== undefined ? summaryRow[idx] : 0;
    });

    // Format daily data points
    const dailyHeaders = dailyRes.data.columnHeaders?.map(c => c.name) || [];
    const dailyPoints = (dailyRes.data.rows || []).map(row => {
      const point = {};
      dailyHeaders.forEach((h, idx) => {
        point[h] = row[idx];
      });
      return point;
    });

    // Format video breakdown and join with local DB titles
    const videoHeaders = videoRes.data.columnHeaders?.map(c => c.name) || [];
    const videoRows = (videoRes.data.rows || []).map(row => {
      const vObj = {};
      videoHeaders.forEach((h, idx) => {
        vObj[h] = row[idx];
      });
      const dbVideo = YouTubeVideos.get(vObj.video);
      vObj.title = dbVideo ? dbVideo.title : `Video (${vObj.video})`;
      vObj.thumbnail = dbVideo ? dbVideo.thumbnail_url : null;
      return vObj;
    });

    return {
      available: true,
      range,
      startDate,
      endDate,
      totals: {
        views: totals.views || 0,
        estimatedMinutesWatched: totals.estimatedMinutesWatched || 0,
        averageViewDurationSeconds: totals.averageViewDuration || 0,
        averageViewPercentage: totals.averageViewPercentage || 0,
        subscribersGained: totals.subscribersGained || 0,
        likes: totals.likes || 0,
        comments: totals.comments || 0,
        shares: totals.shares || 0
      },
      daily: dailyPoints,
      topVideos: videoRows,
      apiTrace: 'YouTube Analytics API v2 (official authenticated query)'
    };

  } catch (err) {
    console.error('[YouTube Analytics Error]:', err.message);
    // If permission or 403 error
    if (err.message.includes('insufficient') || err.message.includes('PERMISSION_DENIED') || err.code === 403) {
      const { getAuthUrl } = require('./youtube_client');
      const authRecord = YouTubeAuth.get();
      return {
        available: false,
        requiresPermissionUpgrade: true,
        authUrl: getAuthUrl(authRecord?.client_id, authRecord?.client_secret, port),
        message: 'Google returned 403: Additional Analytics scope is needed. Please reconnect with Analytics enabled.'
      };
    }
    throw err;
  }
}

/**
 * Queries analytics for a specific video.
 */
async function getVideoAnalytics({ videoId, range = '28d', port = 4242 }) {
  if (!videoId) throw new Error('Video ID is required');

  const permissions = getGrantedPermissions();
  if (!permissions.canAnalytics) {
    return {
      available: false,
      message: 'YouTube Analytics permission required.'
    };
  }

  const oauth2Client = getOAuthClient(port);
  if (!oauth2Client) throw new Error('YouTube channel is not connected.');

  const ytAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });
  const { startDate, endDate } = getDateRange(range);

  try {
    const res = await ytAnalytics.reports.query({
      ids: 'channel==MINE',
      filters: `video==${videoId}`,
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,comments,shares'
    });

    const headers = res.data.columnHeaders?.map(c => c.name) || [];
    const row = res.data.rows?.[0] || [];
    const stats = {};
    headers.forEach((h, idx) => {
      stats[h] = row[idx] !== undefined ? row[idx] : 0;
    });

    return {
      available: true,
      videoId,
      range,
      startDate,
      endDate,
      metrics: stats
    };
  } catch (err) {
    console.error(`[YouTube Video Analytics Error for ${videoId}]:`, err.message);
    return {
      available: false,
      error: err.message
    };
  }
}

/**
 * Generates CSV string for analytics reports.
 */
function exportAnalyticsCSV(reportData) {
  if (!reportData || !reportData.topVideos || reportData.topVideos.length === 0) {
    return 'Video ID,Title,Views,Watch Time (Min),Avg Duration (Sec),Avg View %\n';
  }

  const headers = ['Video ID', 'Title', 'Views', 'Watch Time (Min)', 'Avg Duration (Sec)', 'Avg View %'];
  const rows = reportData.topVideos.map(v => [
    `"${v.video || ''}"`,
    `"${(v.title || '').replace(/"/g, '""')}"`,
    v.views || 0,
    (v.estimatedMinutesWatched || 0).toFixed(1),
    (v.averageViewDuration || 0).toFixed(0),
    `${(v.averageViewPercentage || 0).toFixed(1)}%`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

module.exports = {
  getChannelAnalytics,
  getVideoAnalytics,
  exportAnalyticsCSV
};
