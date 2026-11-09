const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'anymyn_studio.db');
const db = new DatabaseSync(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS project_meta (
    slug TEXT PRIMARY KEY,
    title TEXT,
    youtube_title TEXT,
    youtube_description TEXT,
    tags TEXT,
    category_id TEXT DEFAULT '27',
    default_language TEXT DEFAULT 'en',
    privacy_status TEXT DEFAULT 'private',
    scheduled_publish_time TEXT,
    is_synthetic_media INTEGER DEFAULT 0,
    custom_thumbnail_path TEXT,
    notes TEXT,
    metadata_status TEXT DEFAULT 'draft',
    ai_metadata_raw TEXT,
    scheduling_timezone TEXT DEFAULT 'Asia/Kolkata',
    youtube_published_at TEXT,
    youtube_status TEXT DEFAULT 'not_uploaded',
    is_approved INTEGER DEFAULT 0,
    is_edited INTEGER DEFAULT 0,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS youtube_auth (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_secret TEXT,
    access_token TEXT,
    refresh_token TEXT,
    scope TEXT,
    token_type TEXT,
    expiry_date INTEGER,
    channel_id TEXT,
    channel_title TEXT,
    channel_thumbnail TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS upload_ledger (
    id TEXT PRIMARY KEY,
    project_slug TEXT,
    youtube_video_id TEXT,
    title TEXT,
    privacy_status TEXT,
    status TEXT,
    error_message TEXT,
    bytes_uploaded INTEGER DEFAULT 0,
    total_bytes INTEGER DEFAULT 0,
    youtube_url TEXT,
    scheduled_publish_time TEXT,
    scheduling_timezone TEXT,
    scheduling_confirmed_at TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT,
    project_slug TEXT,
    title TEXT,
    description TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS youtube_videos (
    video_id TEXT PRIMARY KEY,
    channel_id TEXT,
    title TEXT,
    description TEXT,
    tags TEXT,
    category_id TEXT DEFAULT '27',
    default_language TEXT DEFAULT 'en',
    default_audio_language TEXT,
    published_at TEXT,
    thumbnail_url TEXT,
    thumbnails_json TEXT,
    duration TEXT,
    duration_seconds REAL DEFAULT 0,
    dimension TEXT DEFAULT '2d',
    definition TEXT DEFAULT 'hd',
    caption TEXT DEFAULT 'false',
    licensed_content INTEGER DEFAULT 0,
    privacy_status TEXT DEFAULT 'private',
    upload_status TEXT DEFAULT 'processed',
    publish_at TEXT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    local_project_slug TEXT,
    is_channel_only INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0,
    etag TEXT,
    synced_at TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS youtube_sync_state (
    id TEXT PRIMARY KEY,
    channel_id TEXT,
    channel_title TEXT,
    channel_custom_url TEXT,
    channel_thumbnail TEXT,
    subscriber_count TEXT,
    total_views TEXT,
    total_videos INTEGER DEFAULT 0,
    last_synced_at TEXT,
    total_videos_synced INTEGER DEFAULT 0,
    status TEXT DEFAULT 'idle',
    error_message TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS youtube_playlists (
    playlist_id TEXT PRIMARY KEY,
    channel_id TEXT,
    title TEXT,
    description TEXT,
    privacy_status TEXT DEFAULT 'public',
    item_count INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    published_at TEXT,
    synced_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS youtube_playlist_items (
    id TEXT PRIMARY KEY,
    playlist_id TEXT,
    video_id TEXT,
    title TEXT,
    description TEXT,
    thumbnail_url TEXT,
    position INTEGER DEFAULT 0,
    video_published_at TEXT,
    synced_at TEXT
  );

  CREATE TABLE IF NOT EXISTS youtube_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT,
    operation_type TEXT,
    previous_state TEXT,
    requested_state TEXT,
    resulting_state TEXT,
    status TEXT,
    error_message TEXT,
    details TEXT,
    created_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_yt_videos_privacy ON youtube_videos(privacy_status);
  CREATE INDEX IF NOT EXISTS idx_yt_videos_slug ON youtube_videos(local_project_slug);
  CREATE INDEX IF NOT EXISTS idx_yt_videos_published ON youtube_videos(published_at DESC);
  CREATE INDEX IF NOT EXISTS idx_yt_audit_video ON youtube_audit_log(video_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_yt_playlist_items ON youtube_playlist_items(playlist_id, position ASC);
`);

// Apply non-destructive migrations for existing tables
function applyMigrations() {
  const tryAddCol = (table, colDef) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
    } catch (_) {
      // Column already exists or syntax ignored
    }
  };

  tryAddCol('project_meta', "metadata_status TEXT DEFAULT 'draft'");
  tryAddCol('project_meta', "ai_metadata_raw TEXT");
  tryAddCol('project_meta', "scheduling_timezone TEXT DEFAULT 'Asia/Kolkata'");
  tryAddCol('project_meta', "youtube_published_at TEXT");
  tryAddCol('project_meta', "youtube_status TEXT DEFAULT 'not_uploaded'");
  tryAddCol('project_meta', "is_approved INTEGER DEFAULT 0");
  tryAddCol('project_meta', "is_edited INTEGER DEFAULT 0");

  tryAddCol('upload_ledger', "scheduled_publish_time TEXT");
  tryAddCol('upload_ledger', "scheduling_timezone TEXT");
  tryAddCol('upload_ledger', "scheduling_confirmed_at TEXT");
}
applyMigrations();

const ProjectMeta = {
  get(slug) {
    const stmt = db.prepare('SELECT * FROM project_meta WHERE slug = ?');
    return stmt.get(slug) || null;
  },
  getAll() {
    const stmt = db.prepare('SELECT * FROM project_meta ORDER BY updated_at DESC');
    return stmt.all() || [];
  },
  save(slug, data) {
    const now = new Date().toISOString();
    const existing = this.get(slug) || {};
    const merged = { ...existing, ...data, updated_at: now };
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO project_meta (
        slug, title, youtube_title, youtube_description, tags,
        category_id, default_language, privacy_status,
        scheduled_publish_time, is_synthetic_media, custom_thumbnail_path,
        notes, metadata_status, ai_metadata_raw, scheduling_timezone,
        youtube_published_at, youtube_status, is_approved, is_edited, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      slug,
      merged.title || slug,
      merged.youtube_title || '',
      merged.youtube_description || '',
      merged.tags || '',
      merged.category_id || '27', // 27 = Education in YouTube categories
      merged.default_language || 'en',
      merged.privacy_status || 'private', // NON-NEGOTIABLE SAFETY: default private
      merged.scheduled_publish_time || null,
      merged.is_synthetic_media ? 1 : 0,
      merged.custom_thumbnail_path || null,
      merged.notes || '',
      merged.metadata_status || 'draft',
      merged.ai_metadata_raw || null,
      merged.scheduling_timezone || 'Asia/Kolkata',
      merged.youtube_published_at || null,
      merged.youtube_status || 'not_uploaded',
      merged.is_approved ? 1 : 0,
      merged.is_edited ? 1 : 0,
      now
    );

    return this.get(slug);
  }
};

const YouTubeAuth = {
  get() {
    const stmt = db.prepare("SELECT * FROM youtube_auth WHERE id = 'default'");
    return stmt.get() || null;
  },
  saveCredentials(arg1, arg2) {
    const clientId = typeof arg1 === 'object' && arg1 !== null ? arg1.clientId : arg1;
    const clientSecret = typeof arg1 === 'object' && arg1 !== null ? arg1.clientSecret : arg2;
    if (!clientId || !clientSecret) {
      throw new Error('Both clientId and clientSecret are required');
    }
    const now = new Date().toISOString();
    const existing = this.get() || {};
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO youtube_auth (
        id, client_id, client_secret, access_token, refresh_token,
        scope, token_type, expiry_date, channel_id, channel_title,
        channel_thumbnail, updated_at
      ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      String(clientId).trim(),
      String(clientSecret).trim(),
      existing.access_token || null,
      existing.refresh_token || null,
      existing.scope || null,
      existing.token_type || null,
      existing.expiry_date || null,
      existing.channel_id || null,
      existing.channel_title || null,
      existing.channel_thumbnail || null,
      now
    );
    return this.get();
  },
  saveTokens(tokens, channelInfo = {}) {
    const now = new Date().toISOString();
    const existing = this.get() || {};
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO youtube_auth (
        id, client_id, client_secret, access_token, refresh_token,
        scope, token_type, expiry_date, channel_id, channel_title,
        channel_thumbnail, updated_at
      ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      existing.client_id || null,
      existing.client_secret || null,
      tokens.access_token || existing.access_token || null,
      tokens.refresh_token || existing.refresh_token || null,
      tokens.scope || existing.scope || null,
      tokens.token_type || existing.token_type || null,
      tokens.expiry_date || existing.expiry_date || null,
      channelInfo.id || existing.channel_id || null,
      channelInfo.title || existing.channel_title || null,
      channelInfo.thumbnail || existing.channel_thumbnail || null,
      now
    );
    return this.get();
  },
  disconnect() {
    const existing = this.get();
    if (!existing) return;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE youtube_auth SET
        access_token = NULL,
        refresh_token = NULL,
        scope = NULL,
        token_type = NULL,
        expiry_date = NULL,
        channel_id = NULL,
        channel_title = NULL,
        channel_thumbnail = NULL,
        updated_at = ?
      WHERE id = 'default'
    `);
    stmt.run(now);
  }
};

const UploadLedger = {
  create(data) {
    const id = data.id || `up_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO upload_ledger (
        id, project_slug, youtube_video_id, title, privacy_status,
        status, error_message, bytes_uploaded, total_bytes, youtube_url,
        scheduled_publish_time, scheduling_timezone, scheduling_confirmed_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.project_slug,
      data.youtube_video_id || null,
      data.title || '',
      data.privacy_status || 'private',
      data.status || 'pending',
      data.error_message || null,
      data.bytes_uploaded || 0,
      data.total_bytes || 0,
      data.youtube_url || null,
      data.scheduled_publish_time || null,
      data.scheduling_timezone || null,
      data.scheduling_confirmed_at || null,
      now,
      now
    );
    return this.get(id);
  },
  get(id) {
    const stmt = db.prepare('SELECT * FROM upload_ledger WHERE id = ?');
    return stmt.get(id) || null;
  },
  getByProject(slug) {
    const stmt = db.prepare('SELECT * FROM upload_ledger WHERE project_slug = ? ORDER BY created_at DESC');
    return stmt.all(slug) || [];
  },
  getAll() {
    const stmt = db.prepare('SELECT * FROM upload_ledger ORDER BY created_at DESC');
    return stmt.all() || [];
  },
  getScheduled() {
    const stmt = db.prepare(`
      SELECT * FROM upload_ledger 
      WHERE scheduled_publish_time IS NOT NULL 
        AND status IN ('scheduled', 'processing', 'uploading', 'success')
      ORDER BY scheduled_publish_time ASC
    `);
    return stmt.all() || [];
  },
  update(id, data) {
    const existing = this.get(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const merged = { ...existing, ...data, updated_at: now };
    const stmt = db.prepare(`
      UPDATE upload_ledger SET
        youtube_video_id = ?,
        title = ?,
        privacy_status = ?,
        status = ?,
        error_message = ?,
        bytes_uploaded = ?,
        total_bytes = ?,
        youtube_url = ?,
        scheduled_publish_time = ?,
        scheduling_timezone = ?,
        scheduling_confirmed_at = ?,
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.youtube_video_id,
      merged.title,
      merged.privacy_status,
      merged.status,
      merged.error_message,
      merged.bytes_uploaded,
      merged.total_bytes,
      merged.youtube_url,
      merged.scheduled_publish_time || null,
      merged.scheduling_timezone || null,
      merged.scheduling_confirmed_at || null,
      now,
      id
    );
    return this.get(id);
  }
};

const ActivityLog = {
  add(eventType, projectSlug, title, description) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO activity_log (event_type, project_slug, title, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(eventType, projectSlug || null, title, description, now);
  },
  getRecent(limit = 20) {
    const stmt = db.prepare('SELECT * FROM activity_log ORDER BY id DESC LIMIT ?');
    return stmt.all(limit) || [];
  }
};

const YouTubeVideos = {
  get(videoId) {
    const stmt = db.prepare('SELECT * FROM youtube_videos WHERE video_id = ?');
    return stmt.get(videoId) || null;
  },
  getBySlug(slug) {
    const stmt = db.prepare('SELECT * FROM youtube_videos WHERE local_project_slug = ? AND is_deleted = 0');
    return stmt.get(slug) || null;
  },
  getAll({ privacyStatus = 'all', source = 'all', search = '', limit = 200, offset = 0 } = {}) {
    let sql = 'SELECT * FROM youtube_videos WHERE is_deleted = 0';
    const params = [];

    if (privacyStatus && privacyStatus !== 'all') {
      if (privacyStatus === 'scheduled') {
        sql += " AND (privacy_status = 'scheduled' OR (publish_at IS NOT NULL AND publish_at != ''))";
      } else {
        sql += ' AND privacy_status = ?';
        params.push(privacyStatus.toLowerCase());
      }
    }

    if (source === 'local') {
      sql += ' AND is_channel_only = 0';
    } else if (source === 'channel_only') {
      sql += ' AND is_channel_only = 1';
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR video_id LIKE ?)';
      params.push(q, q, q);
    }

    sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(sql);
    return stmt.all(...params) || [];
  },
  getCount({ privacyStatus = 'all', source = 'all', search = '' } = {}) {
    let sql = 'SELECT COUNT(*) as count FROM youtube_videos WHERE is_deleted = 0';
    const params = [];

    if (privacyStatus && privacyStatus !== 'all') {
      if (privacyStatus === 'scheduled') {
        sql += " AND (privacy_status = 'scheduled' OR (publish_at IS NOT NULL AND publish_at != ''))";
      } else {
        sql += ' AND privacy_status = ?';
        params.push(privacyStatus.toLowerCase());
      }
    }

    if (source === 'local') {
      sql += ' AND is_channel_only = 0';
    } else if (source === 'channel_only') {
      sql += ' AND is_channel_only = 1';
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR video_id LIKE ?)';
      params.push(q, q, q);
    }

    const stmt = db.prepare(sql);
    const row = stmt.get(...params);
    return row ? row.count : 0;
  },
  getSummaryStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM youtube_videos WHERE is_deleted = 0');
    const publicStmt = db.prepare("SELECT COUNT(*) as count FROM youtube_videos WHERE is_deleted = 0 AND privacy_status = 'public'");
    const unlistedStmt = db.prepare("SELECT COUNT(*) as count FROM youtube_videos WHERE is_deleted = 0 AND privacy_status = 'unlisted'");
    const privateStmt = db.prepare("SELECT COUNT(*) as count FROM youtube_videos WHERE is_deleted = 0 AND privacy_status = 'private' AND (publish_at IS NULL OR publish_at = '')");
    const scheduledStmt = db.prepare("SELECT COUNT(*) as count FROM youtube_videos WHERE is_deleted = 0 AND (privacy_status = 'scheduled' OR (publish_at IS NOT NULL AND publish_at != ''))");
    const viewsStmt = db.prepare('SELECT SUM(view_count) as views, SUM(like_count) as likes, SUM(comment_count) as comments FROM youtube_videos WHERE is_deleted = 0');

    const total = totalStmt.get()?.count || 0;
    const pub = publicStmt.get()?.count || 0;
    const unl = unlistedStmt.get()?.count || 0;
    const priv = privateStmt.get()?.count || 0;
    const sched = scheduledStmt.get()?.count || 0;
    const agg = viewsStmt.get() || {};

    return {
      totalVideos: total,
      publicVideos: pub,
      unlistedVideos: unl,
      privateVideos: priv,
      scheduledVideos: sched,
      totalViews: agg.views || 0,
      totalLikes: agg.likes || 0,
      totalComments: agg.comments || 0
    };
  },
  upsert(data) {
    const now = new Date().toISOString();
    const existing = this.get(data.video_id) || {};
    const merged = { ...existing, ...data, updated_at: now };
    if (!existing.created_at) merged.created_at = now;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO youtube_videos (
        video_id, channel_id, title, description, tags, category_id,
        default_language, default_audio_language, published_at, thumbnail_url,
        thumbnails_json, duration, duration_seconds, dimension, definition,
        caption, licensed_content, privacy_status, upload_status, publish_at,
        view_count, like_count, comment_count, local_project_slug, is_channel_only,
        is_deleted, etag, synced_at, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      merged.video_id,
      merged.channel_id || null,
      merged.title || '',
      merged.description || '',
      typeof merged.tags === 'object' && merged.tags !== null ? JSON.stringify(merged.tags) : (merged.tags || ''),
      merged.category_id || '27',
      merged.default_language || 'en',
      merged.default_audio_language || null,
      merged.published_at || null,
      merged.thumbnail_url || null,
      typeof merged.thumbnails_json === 'object' && merged.thumbnails_json !== null ? JSON.stringify(merged.thumbnails_json) : (merged.thumbnails_json || null),
      merged.duration || null,
      Number(merged.duration_seconds || 0),
      merged.dimension || '2d',
      merged.definition || 'hd',
      merged.caption || 'false',
      merged.licensed_content ? 1 : 0,
      merged.privacy_status || 'private',
      merged.upload_status || 'processed',
      merged.publish_at || null,
      Number(merged.view_count || 0),
      Number(merged.like_count || 0),
      Number(merged.comment_count || 0),
      merged.local_project_slug || null,
      merged.is_channel_only ? 1 : 0,
      merged.is_deleted ? 1 : 0,
      merged.etag || null,
      merged.synced_at || now,
      merged.created_at,
      now
    );

    return this.get(merged.video_id);
  },
  updatePrivacy(videoId, privacyStatus, publishAt = null) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE youtube_videos SET
        privacy_status = ?,
        publish_at = ?,
        updated_at = ?
      WHERE video_id = ?
    `);
    stmt.run(privacyStatus, publishAt, now, videoId);
    return this.get(videoId);
  },
  updateMetadata(videoId, { title, description, tags, categoryId, defaultLanguage }) {
    const now = new Date().toISOString();
    const existing = this.get(videoId);
    if (!existing) return null;

    const finalTags = typeof tags === 'object' && tags !== null ? JSON.stringify(tags) : (tags !== undefined ? tags : existing.tags);

    const stmt = db.prepare(`
      UPDATE youtube_videos SET
        title = ?,
        description = ?,
        tags = ?,
        category_id = ?,
        default_language = ?,
        updated_at = ?
      WHERE video_id = ?
    `);
    stmt.run(
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      finalTags,
      categoryId !== undefined ? categoryId : existing.category_id,
      defaultLanguage !== undefined ? defaultLanguage : existing.default_language,
      now,
      videoId
    );
    return this.get(videoId);
  },
  updateThumbnail(videoId, thumbnailUrl, thumbnailsJson = null) {
    const now = new Date().toISOString();
    const jsonStr = typeof thumbnailsJson === 'object' && thumbnailsJson !== null ? JSON.stringify(thumbnailsJson) : thumbnailsJson;
    const stmt = db.prepare(`
      UPDATE youtube_videos SET
        thumbnail_url = ?,
        thumbnails_json = COALESCE(?, thumbnails_json),
        updated_at = ?
      WHERE video_id = ?
    `);
    stmt.run(thumbnailUrl, jsonStr, now, videoId);
    return this.get(videoId);
  },
  markDeleted(videoId) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`UPDATE youtube_videos SET is_deleted = 1, updated_at = ? WHERE video_id = ?`);
    stmt.run(now, videoId);
  }
};

const YouTubeSyncState = {
  get() {
    const stmt = db.prepare("SELECT * FROM youtube_sync_state WHERE id = 'channel_sync'");
    return stmt.get() || null;
  },
  set(data) {
    const now = new Date().toISOString();
    const existing = this.get() || {};
    const merged = { ...existing, ...data, updated_at: now };

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO youtube_sync_state (
        id, channel_id, channel_title, channel_custom_url, channel_thumbnail,
        subscriber_count, total_views, total_videos, last_synced_at,
        total_videos_synced, status, error_message, updated_at
      ) VALUES ('channel_sync', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      merged.channel_id || null,
      merged.channel_title || null,
      merged.channel_custom_url || null,
      merged.channel_thumbnail || null,
      merged.subscriber_count !== undefined ? String(merged.subscriber_count) : null,
      merged.total_views !== undefined ? String(merged.total_views) : null,
      Number(merged.total_videos || 0),
      merged.last_synced_at || now,
      Number(merged.total_videos_synced || 0),
      merged.status || 'idle',
      merged.error_message || null,
      now
    );
    return this.get();
  }
};

const YouTubePlaylists = {
  getAll() {
    const stmt = db.prepare('SELECT * FROM youtube_playlists ORDER BY published_at DESC');
    return stmt.all() || [];
  },
  get(playlistId) {
    const stmt = db.prepare('SELECT * FROM youtube_playlists WHERE playlist_id = ?');
    return stmt.get(playlistId) || null;
  },
  upsert(data) {
    const now = new Date().toISOString();
    const existing = this.get(data.playlist_id) || {};
    const merged = { ...existing, ...data, updated_at: now };

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO youtube_playlists (
        playlist_id, channel_id, title, description, privacy_status,
        item_count, thumbnail_url, published_at, synced_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      merged.playlist_id,
      merged.channel_id || null,
      merged.title || '',
      merged.description || '',
      merged.privacy_status || 'public',
      Number(merged.item_count || 0),
      merged.thumbnail_url || null,
      merged.published_at || null,
      merged.synced_at || now,
      now
    );
    return this.get(merged.playlist_id);
  },
  delete(playlistId) {
    const delItems = db.prepare('DELETE FROM youtube_playlist_items WHERE playlist_id = ?');
    delItems.run(playlistId);
    const stmt = db.prepare('DELETE FROM youtube_playlists WHERE playlist_id = ?');
    stmt.run(playlistId);
  }
};

const YouTubePlaylistItems = {
  getByPlaylist(playlistId) {
    const stmt = db.prepare('SELECT * FROM youtube_playlist_items WHERE playlist_id = ? ORDER BY position ASC');
    return stmt.all(playlistId) || [];
  },
  upsert(data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO youtube_playlist_items (
        id, playlist_id, video_id, title, description,
        thumbnail_url, position, video_published_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      data.id,
      data.playlist_id,
      data.video_id,
      data.title || '',
      data.description || '',
      data.thumbnail_url || null,
      Number(data.position || 0),
      data.video_published_at || null,
      data.synced_at || now
    );
  },
  delete(id) {
    const stmt = db.prepare('DELETE FROM youtube_playlist_items WHERE id = ?');
    stmt.run(id);
  },
  clearPlaylist(playlistId) {
    const stmt = db.prepare('DELETE FROM youtube_playlist_items WHERE playlist_id = ?');
    stmt.run(playlistId);
  }
};

const YouTubeAuditLog = {
  add({ videoId, operationType, previousState, requestedState, resultingState, status, errorMessage, details }) {
    const now = new Date().toISOString();
    const prevStr = typeof previousState === 'object' && previousState !== null ? JSON.stringify(previousState) : (previousState || null);
    const reqStr = typeof requestedState === 'object' && requestedState !== null ? JSON.stringify(requestedState) : (requestedState || null);
    const resStr = typeof resultingState === 'object' && resultingState !== null ? JSON.stringify(resultingState) : (resultingState || null);
    const detailsStr = typeof details === 'object' && details !== null ? JSON.stringify(details) : (details || null);

    const stmt = db.prepare(`
      INSERT INTO youtube_audit_log (
        video_id, operation_type, previous_state, requested_state,
        resulting_state, status, error_message, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      videoId || null,
      operationType,
      prevStr,
      reqStr,
      resStr,
      status || 'SUCCESS',
      errorMessage || null,
      detailsStr,
      now
    );
  },
  getRecent(limit = 50) {
    const stmt = db.prepare('SELECT * FROM youtube_audit_log ORDER BY id DESC LIMIT ?');
    return stmt.all(limit) || [];
  },
  getByVideo(videoId, limit = 20) {
    const stmt = db.prepare('SELECT * FROM youtube_audit_log WHERE video_id = ? ORDER BY id DESC LIMIT ?');
    return stmt.all(videoId, limit) || [];
  }
};

module.exports = {
  db,
  ProjectMeta,
  YouTubeAuth,
  UploadLedger,
  ActivityLog,
  YouTubeVideos,
  YouTubeSyncState,
  YouTubePlaylists,
  YouTubePlaylistItems,
  YouTubeAuditLog
};
