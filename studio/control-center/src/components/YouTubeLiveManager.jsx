import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  Globe, 
  Lock, 
  Share2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  ExternalLink, 
  Save, 
  RotateCcw, 
  Upload, 
  Image as ImageIcon,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  FileText
} from 'lucide-react';

export default function YouTubeLiveManager({
  videoId,
  videoData,
  project,
  youtubeAuth,
  onRefresh,
  onOpenYouTubeSettings,
  showToast
}) {
  const [video, setVideo] = useState(videoData || null);
  const [isLoading, setIsLoading] = useState(!videoData);
  const [auditTrail, setAuditTrail] = useState([]);

  // Visibility state
  const [selectedPrivacy, setSelectedPrivacy] = useState(videoData?.privacy_status || 'private');
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
  const [showPublicConfirm, setShowPublicConfirm] = useState(false);

  // Metadata editor state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('27');
  const [language, setLanguage] = useState('en');
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Custom thumbnail state
  const [selectedThumbFile, setSelectedThumbFile] = useState(null);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState(null);
  const [thumbError, setThumbError] = useState(null);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  const permissions = youtubeAuth?.permissions || {};

  // Fetch full video details from backend API
  const fetchVideoDetails = async () => {
    if (!videoId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/youtube/videos/${videoId}`);
      const data = await res.json();
      if (data.success && data.video) {
        setVideo(data.video);
        setSelectedPrivacy(data.video.privacy_status || 'private');
        setAuditTrail(data.auditTrail || []);

        // Initialize editor fields
        setTitle(data.video.title || '');
        setDescription(data.video.description || '');
        setCategory(data.video.category_id || '27');
        setLanguage(data.video.default_language || 'en');

        let tagsFormatted = '';
        if (data.video.tags) {
          try {
            const parsed = JSON.parse(data.video.tags);
            tagsFormatted = Array.isArray(parsed) ? parsed.join(', ') : data.video.tags;
          } catch (_) {
            tagsFormatted = data.video.tags;
          }
        }
        setTags(tagsFormatted);
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Failed to load video details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoDetails();
  }, [videoId]);

  // Track if metadata is dirty
  const handleTitleChange = (val) => { setTitle(val); setIsDirty(true); };
  const handleDescChange = (val) => { setDescription(val); setIsDirty(true); };
  const handleTagsChange = (val) => { setTags(val); setIsDirty(true); };
  const handleCategoryChange = (val) => { setCategory(val); setIsDirty(true); };
  const handleLanguageChange = (val) => { setLanguage(val); setIsDirty(true); };

  const handleResetMetadata = () => {
    if (!video) return;
    setTitle(video.title || '');
    setDescription(video.description || '');
    setCategory(video.category_id || '27');
    setLanguage(video.default_language || 'en');
    try {
      const parsed = JSON.parse(video.tags || '[]');
      setTags(Array.isArray(parsed) ? parsed.join(', ') : (video.tags || ''));
    } catch (_) {
      setTags(video.tags || '');
    }
    setIsDirty(false);
  };

  // 1. Visibility Update Handler
  const handlePrivacyChange = async (newPrivacy, confirmed = false) => {
    if (newPrivacy === 'public' && !confirmed) {
      setSelectedPrivacy(newPrivacy);
      setShowPublicConfirm(true);
      return;
    }

    setIsUpdatingPrivacy(true);
    try {
      const res = await fetch(`/api/youtube/videos/${videoId}/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacyStatus: newPrivacy,
          confirmPublic: confirmed
        })
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(`Verified: Visibility updated to ${newPrivacy.toUpperCase()}`, 'success');
        setShowPublicConfirm(false);
        await fetchVideoDetails();
        if (onRefresh) onRefresh();
      } else if (data.requiresConfirmation) {
        setShowPublicConfirm(true);
      } else if (data.requiresPermissionUpgrade) {
        if (showToast) showToast(data.message, 'error');
        onOpenYouTubeSettings();
      } else {
        if (showToast) showToast(data.error || 'Failed to update visibility', 'error');
        setSelectedPrivacy(video?.privacy_status || 'private');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
      setSelectedPrivacy(video?.privacy_status || 'private');
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  // 2. Metadata Save Handler (Strict Safety Invariant)
  const handleSaveMetadata = async () => {
    if (!title.trim()) {
      if (showToast) showToast('Title cannot be empty', 'error');
      return;
    }

    setIsSavingMetadata(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);

      const res = await fetch(`/api/youtube/videos/${videoId}/metadata`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description,
          tags: tagsArray,
          categoryId: category,
          defaultLanguage: language
        })
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Verified: YouTube metadata updated successfully', 'success');
        setIsDirty(false);
        await fetchVideoDetails();
        if (onRefresh) onRefresh();
      } else if (data.requiresPermissionUpgrade) {
        if (showToast) showToast(data.message, 'error');
        onOpenYouTubeSettings();
      } else {
        if (showToast) showToast(data.error || 'Failed to update metadata', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsSavingMetadata(false);
    }
  };

  // 3. Custom Thumbnail Handler
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB per YouTube API limit)
    if (file.size > 2 * 1024 * 1024) {
      setThumbError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds YouTube's 2 MB limit.`);
      setSelectedThumbFile(null);
      setThumbPreviewUrl(null);
      return;
    }

    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setThumbError('Only JPEG, PNG, or WebP images are supported.');
      setSelectedThumbFile(null);
      setThumbPreviewUrl(null);
      return;
    }

    setThumbError(null);
    setSelectedThumbFile(file);
    setThumbPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadThumbnail = async () => {
    if (!selectedThumbFile) return;

    setIsUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', selectedThumbFile);

      const res = await fetch(`/api/youtube/videos/${videoId}/thumbnail`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Verified: Custom thumbnail applied to YouTube', 'success');
        setSelectedThumbFile(null);
        setThumbPreviewUrl(null);
        await fetchVideoDetails();
        if (onRefresh) onRefresh();
      } else if (data.requiresPermissionUpgrade) {
        if (showToast) showToast(data.message, 'error');
        onOpenYouTubeSettings();
      } else {
        if (showToast) showToast(data.error || 'Failed to set thumbnail', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsUploadingThumb(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        <RotateCw size={24} className="spin-anim" style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: 13 }}>Loading verified YouTube video status...</p>
      </div>
    );
  }

  const currentPrivacy = (video?.privacy_status || 'private').toLowerCase();
  const isScheduled = !!video?.publish_at || currentPrivacy === 'scheduled';
  const youtubeUrl = `https://youtu.be/${videoId}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. TOP LIVE STATUS HERO CARD */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 10,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-delicate)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 6, borderRadius: 6, background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
              <Youtube size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Live YouTube Channel Video
                </span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  ID: {videoId}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Verified on channel <strong>{youtubeAuth?.channel?.channelTitle || 'Finance Sensei'}</strong>
                {video?.synced_at && ` · Last verified ${new Date(video.synced_at).toLocaleTimeString()}`}
              </div>
            </div>
          </div>

          <a
            href={youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px' }}
          >
            <span>Watch on YouTube</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Live stats pills: Views, Likes, Comments, Upload Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          fontSize: 12,
          padding: '10px 14px',
          background: 'var(--bg-panel)',
          borderRadius: 6,
          border: '1px solid var(--border-delicate)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-primary)' }}>
            <Eye size={14} color="var(--accent-gold)" />
            <span>Views: <strong>{(video?.view_count || 0).toLocaleString()}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-primary)' }}>
            <ThumbsUp size={13} color="var(--accent-emerald)" />
            <span>Likes: <strong>{(video?.like_count || 0).toLocaleString()}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-primary)' }}>
            <MessageSquare size={13} color="var(--text-muted)" />
            <span>Comments: <strong>{(video?.comment_count || 0).toLocaleString()}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            <span>Processing: <strong className="font-mono" style={{ color: 'var(--accent-emerald)' }}>{video?.upload_status || 'processed'}</strong></span>
            <span>·</span>
            <span>Duration: <strong className="font-mono">{video?.duration ? video.duration.replace('PT', '').replace('S', 's').replace('M', 'm ') : '—'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. VIDEO VISIBILITY MANAGEMENT */}
      <div className="anymyn-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Visibility Controls
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Manage access permissions on YouTube. All transitions send real verified API requests.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {currentPrivacy === 'public' && (
              <span className="badge badge-emerald font-mono" style={{ padding: '3px 9px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={12} /> PUBLIC RELEASE
              </span>
            )}
            {currentPrivacy === 'unlisted' && (
              <span className="badge badge-gold font-mono" style={{ padding: '3px 9px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Share2 size={12} /> UNLISTED
              </span>
            )}
            {currentPrivacy === 'private' && (
              <span className="badge font-mono" style={{ padding: '3px 9px', fontSize: 11, background: 'var(--bg-wall)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock size={12} /> PRIVATE
              </span>
            )}
            {isScheduled && (
              <span className="badge badge-gold font-mono" style={{ padding: '3px 9px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> SCHEDULED ({new Date(video.publish_at).toLocaleString()})
              </span>
            )}
          </div>
        </div>

        {/* Scheduled Warning if video has active future release */}
        {video?.publish_at && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 6,
            background: 'var(--accent-gold-light)',
            border: '1px solid var(--accent-gold-border)',
            marginBottom: 16,
            fontSize: 12,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <Clock size={16} color="var(--accent-gold)" />
            <span>
              <strong>Active Scheduled Release:</strong> This video is currently scheduled to go public on <strong>{new Date(video.publish_at).toLocaleString()}</strong>. Changing its privacy status will cancel or override this automatic release schedule.
            </span>
          </div>
        )}

        {/* Visibility Selector Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {/* Option: Private */}
          <button
            onClick={() => handlePrivacyChange('private', true)}
            disabled={isUpdatingPrivacy || currentPrivacy === 'private'}
            style={{
              padding: '14px',
              borderRadius: 8,
              border: currentPrivacy === 'private' ? '2px solid var(--accent-gold)' : '1px solid var(--border-delicate)',
              background: currentPrivacy === 'private' ? 'var(--bg-card-hover)' : 'var(--bg-surface)',
              cursor: currentPrivacy === 'private' ? 'default' : 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Lock size={15} color={currentPrivacy === 'private' ? 'var(--accent-gold)' : 'var(--text-muted)'} />
              <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Private</strong>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Only you and channel managers can watch this video.
            </p>
          </button>

          {/* Option: Unlisted */}
          <button
            onClick={() => handlePrivacyChange('unlisted', true)}
            disabled={isUpdatingPrivacy || currentPrivacy === 'unlisted'}
            style={{
              padding: '14px',
              borderRadius: 8,
              border: currentPrivacy === 'unlisted' ? '2px solid var(--accent-gold)' : '1px solid var(--border-delicate)',
              background: currentPrivacy === 'unlisted' ? 'var(--bg-card-hover)' : 'var(--bg-surface)',
              cursor: currentPrivacy === 'unlisted' ? 'default' : 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Share2 size={15} color={currentPrivacy === 'unlisted' ? 'var(--accent-gold)' : 'var(--text-muted)'} />
              <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Unlisted</strong>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Anyone with the video link can watch. Does not appear on channel page.
            </p>
          </button>

          {/* Option: Public */}
          <button
            onClick={() => handlePrivacyChange('public', false)}
            disabled={isUpdatingPrivacy || currentPrivacy === 'public'}
            style={{
              padding: '14px',
              borderRadius: 8,
              border: currentPrivacy === 'public' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-delicate)',
              background: currentPrivacy === 'public' ? 'var(--bg-card-hover)' : 'var(--bg-surface)',
              cursor: currentPrivacy === 'public' ? 'default' : 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Globe size={15} color={currentPrivacy === 'public' ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
              <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Public</strong>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Everyone can see this video. Published on YouTube feed and searches.
            </p>
          </button>
        </div>
      </div>

      {/* 3. DEDICATED METADATA MANAGEMENT */}
      <div className="anymyn-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Publishing Metadata Editor
              </h3>
              {isDirty && (
                <span className="badge badge-gold font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>
                  Unsaved edits
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Directly edit the live snippet on YouTube. Preserves descriptions, tags, and category safety.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isDirty && (
              <button
                type="button"
                onClick={handleResetMetadata}
                className="btn-outline"
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveMetadata}
              disabled={isSavingMetadata || !isDirty}
              className="btn-primary"
              style={{ fontSize: 12, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={13} />
              <span>{isSavingMetadata ? 'Saving to YouTube...' : 'Save to YouTube'}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Video Title *
              </label>
              <span style={{ fontSize: 11, color: title.length > 100 ? 'var(--accent-crimson)' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                {title.length}/100 chars
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="anymyn-input"
              maxLength={100}
              style={{ fontSize: 13, fontWeight: 500 }}
            />
          </div>

          {/* Description */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Description
              </label>
              <span style={{ fontSize: 11, color: description.length > 5000 ? 'var(--accent-crimson)' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                {description.length}/5000 chars
              </span>
            </div>
            <textarea
              rows={8}
              value={description}
              onChange={e => handleDescChange(e.target.value)}
              className="anymyn-input"
              maxLength={5000}
              style={{ fontSize: 12.5, lineHeight: 1.5, fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          {/* Tags */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Tags (comma-separated)
              </label>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {tags.length}/500 chars
              </span>
            </div>
            <input
              type="text"
              value={tags}
              onChange={e => handleTagsChange(e.target.value)}
              className="anymyn-input"
              placeholder="e.g. personal finance, investing, money, budget"
              style={{ fontSize: 12.5 }}
            />
          </div>

          {/* Category & Language Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Category
              </label>
              <select
                value={category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="anymyn-input"
                style={{ fontSize: 12.5 }}
              >
                <option value="27">Education (Default)</option>
                <option value="28">Science & Technology</option>
                <option value="22">People & Blogs</option>
                <option value="24">Entertainment</option>
                <option value="25">News & Politics</option>
                <option value="26">Howto & Style</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Default Language
              </label>
              <select
                value={language}
                onChange={e => handleLanguageChange(e.target.value)}
                className="anymyn-input"
                style={{ fontSize: 12.5 }}
              >
                <option value="en">English (en)</option>
                <option value="en-IN">English - India (en-IN)</option>
                <option value="en-US">English - US (en-US)</option>
                <option value="hi">Hindi (hi)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CUSTOM THUMBNAIL MANAGEMENT */}
      <div className="anymyn-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Custom Thumbnail Management
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Replace the official YouTube thumbnail via <code className="font-mono">thumbnails.set</code>. Max file size: 2 MB.
          </p>
        </div>

        {thumbError && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 6,
            background: 'var(--accent-crimson-light)',
            color: 'var(--accent-crimson)',
            fontSize: 12,
            marginBottom: 16
          }}>
            {thumbError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Current Live Thumbnail */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Current YouTube Thumbnail
            </label>
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#000',
              border: '1px solid var(--border-delicate)'
            }}>
              {video?.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt="Live Thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
          </div>

          {/* Selected New Thumbnail / Upload Zone */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Select Replacement Image
            </label>
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--bg-panel)',
              border: '2px dashed var(--border-delicate)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {thumbPreviewUrl ? (
                <img
                  src={thumbPreviewUrl}
                  alt="New Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Upload size={28} color="var(--accent-gold)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    Choose image file
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    JPG, PNG, or WebP (under 2 MB)
                  </div>
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </div>

            {selectedThumbFile && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Selected: {(selectedThumbFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  onClick={handleUploadThumbnail}
                  disabled={isUploadingThumb}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '6px 14px' }}
                >
                  {isUploadingThumb ? 'Uploading...' : 'Apply Thumbnail'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. AUDIT & ACTIVITY HISTORY FOR THIS VIDEO */}
      <div className="anymyn-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Verified Operation Ledger
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Audit log of verified changes applied to this YouTube video resource.
            </p>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {auditTrail.length} operations logged
          </span>
        </div>

        {auditTrail.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            No recent operations recorded for this video ID.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {auditTrail.map((entry, idx) => (
              <div
                key={entry.id || idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-delicate)',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {entry.operation_type.replace(/_/g, ' ')}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                    {entry.details || entry.status}
                  </div>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PUBLIC PUBLISH CONFIRMATION MODAL */}
      {showPublicConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--modal-overlay-bg)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div className="anymyn-card" style={{ maxWidth: 480, width: '100%', padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--accent-gold-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              color: 'var(--accent-gold)'
            }}>
              <Globe size={24} />
            </div>

            <h3 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Make Video Public on YouTube?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              Once you confirm, ANYMYN will send a real API update to YouTube making <strong>"{title || video?.title}"</strong> visible to the entire public. Anyone will be able to discover and watch this video.
            </p>

            {video?.publish_at && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 6,
                background: 'var(--accent-crimson-light)',
                color: 'var(--accent-crimson)',
                fontSize: 12,
                marginBottom: 18
              }}>
                ⚠️ This video was previously scheduled for release at {new Date(video.publish_at).toLocaleString()}. Making it public now will release it immediately.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setShowPublicConfirm(false);
                  setSelectedPrivacy(video?.privacy_status || 'private');
                }}
                className="btn-outline"
                style={{ fontSize: 12.5 }}
              >
                Keep Private
              </button>
              <button
                type="button"
                disabled={isUpdatingPrivacy}
                onClick={() => handlePrivacyChange('public', true)}
                className="btn-primary"
                style={{ fontSize: 12.5, background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
              >
                {isUpdatingPrivacy ? 'Applying...' : 'Confirm & Publish Publicly'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
