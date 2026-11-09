import React, { useState } from 'react';
import { 
  Film, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Youtube, 
  FileText, 
  Volume2, 
  Sparkles,
  ExternalLink,
  ArrowRight,
  Globe,
  Lock,
  Share2,
  Calendar,
  Layers,
  Tag
} from 'lucide-react';

export default function LibraryView({ 
  projects = [], 
  channelVideos = [], 
  onSelectProject, 
  onSelectVideo,
  onOpenYouTubeSettings 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'local' | 'channel'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'public' | 'unlisted' | 'private' | 'scheduled' | 'rendered'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Combine local projects and channel videos into a unified library list
  // Videos that are both local and uploaded are merged to avoid duplicate entries!
  const unifiedEntries = [];
  const processedVideoIds = new Set();
  const processedSlugs = new Set();

  // 1. First add local projects
  for (const p of projects) {
    const meta = p.metadata || {};
    const ytVideoId = meta.youtubeVideoId || p.latestUpload?.youtube_video_id;
    const matchingChannelVideo = ytVideoId ? channelVideos.find(v => v.video_id === ytVideoId) : null;

    if (ytVideoId) processedVideoIds.add(ytVideoId);
    processedSlugs.add(p.slug);

    unifiedEntries.push({
      id: `local_${p.slug}`,
      type: ytVideoId ? 'local_and_uploaded' : 'local_only',
      localSlug: p.slug,
      project: p,
      videoId: ytVideoId || null,
      title: meta.youtubeTitle || p.title,
      description: meta.youtubeDescription || '',
      tags: meta.youtubeTags || meta.tags || '',
      thumbnail: p.contactSheetPath 
        ? `/api/media/contact-sheet/${p.slug}` 
        : (matchingChannelVideo?.thumbnail_url || (p.renderPath ? `/api/media/thumbnail/${p.slug}` : null)),
      durationFormatted: p.videoStream?.durationFormatted || matchingChannelVideo?.duration || null,
      durationSeconds: p.videoStream?.duration || matchingChannelVideo?.duration_seconds || 0,
      privacyStatus: matchingChannelVideo?.privacy_status || meta.privacyStatus || 'draft',
      publishAt: matchingChannelVideo?.publish_at || meta.scheduledPublishTime || null,
      hasRenderedVideo: p.hasRenderedVideo,
      hasVoiceover: p.hasVoiceover,
      status: p.status,
      views: matchingChannelVideo?.view_count || 0,
      likes: matchingChannelVideo?.like_count || 0,
      publishedAt: matchingChannelVideo?.published_at || meta.youtubePublishedAt || null
    });
  }

  // 2. Add channel videos that have no matching local project (YouTube-only)
  for (const v of channelVideos) {
    if (!processedVideoIds.has(v.video_id) && (!v.local_project_slug || !processedSlugs.has(v.local_project_slug))) {
      unifiedEntries.push({
        id: `channel_${v.video_id}`,
        type: 'channel_only',
        localSlug: null,
        project: null,
        videoId: v.video_id,
        title: v.title,
        description: v.description,
        tags: v.tags,
        thumbnail: v.thumbnail_url,
        durationFormatted: v.duration ? v.duration.replace('PT', '').replace('S', 's').replace('M', 'm ') : null,
        durationSeconds: v.duration_seconds || 0,
        privacyStatus: v.privacy_status || 'private',
        publishAt: v.publish_at || null,
        hasRenderedVideo: false,
        hasVoiceover: false,
        status: v.privacy_status ? v.privacy_status.toUpperCase() : 'UPLOADED',
        views: v.view_count || 0,
        likes: v.like_count || 0,
        publishedAt: v.published_at
      });
    }
  }

  // Filtering
  const filteredEntries = unifiedEntries.filter(item => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSlug = item.localSlug?.toLowerCase().includes(q);
      const matchId = item.videoId?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchId && !matchDesc) return false;
    }

    // Source filter match
    if (sourceFilter === 'local' && item.type === 'channel_only') return false;
    if (sourceFilter === 'channel' && item.type === 'local_only') return false;

    // Status filter match
    const priv = (item.privacyStatus || '').toLowerCase();
    if (statusFilter === 'public' && priv !== 'public') return false;
    if (statusFilter === 'unlisted' && priv !== 'unlisted') return false;
    if (statusFilter === 'private' && (priv !== 'private' || item.publishAt)) return false;
    if (statusFilter === 'scheduled' && !item.publishAt && priv !== 'scheduled') return false;
    if (statusFilter === 'rendered' && !item.hasRenderedVideo) return false;

    return true;
  });

  const localCount = unifiedEntries.filter(e => e.type !== 'channel_only').length;
  const channelCount = unifiedEntries.filter(e => e.videoId).length;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header & Controls Monolith */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 20,
        paddingBottom: 20,
        borderBottom: '1px solid var(--border-delicate)'
      }}>
        <div>
          <h1 className="font-cinzel" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Video Control Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Unified catalog of local production projects and live YouTube channel uploads.
          </p>
        </div>

        {/* Search & View toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-delicate)',
            borderRadius: 6,
            padding: '6px 12px',
            width: 280
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search title, slug, video ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 13,
                width: '100%',
                background: 'transparent',
                color: 'var(--text-primary)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}
              >
                &times;
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-delicate)',
            borderRadius: 6,
            padding: 2
          }}>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              style={{
                padding: '6px 10px',
                border: 'none',
                background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                borderRadius: 4,
                cursor: 'pointer',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-subtle)' : 'none'
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              style={{
                padding: '6px 10px',
                border: 'none',
                background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                borderRadius: 4,
                cursor: 'pointer',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'list' ? 'var(--shadow-subtle)' : 'none'
              }}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Source Filter Tabs & Visibility Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 24
      }}>
        {/* Source Segmented Control */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-delicate)',
          borderRadius: 8,
          padding: 3
        }}>
          <button
            onClick={() => setSourceFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: sourceFilter === 'all' ? 'var(--bg-surface)' : 'transparent',
              color: sourceFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: sourceFilter === 'all' ? 'var(--shadow-subtle)' : 'none'
            }}
          >
            All Videos ({unifiedEntries.length})
          </button>
          <button
            onClick={() => setSourceFilter('channel')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: sourceFilter === 'channel' ? 'var(--bg-surface)' : 'transparent',
              color: sourceFilter === 'channel' ? 'var(--accent-gold)' : 'var(--text-muted)',
              boxShadow: sourceFilter === 'channel' ? 'var(--shadow-subtle)' : 'none'
            }}
          >
            YouTube Channel ({channelCount})
          </button>
          <button
            onClick={() => setSourceFilter('local')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: sourceFilter === 'local' ? 'var(--bg-surface)' : 'transparent',
              color: sourceFilter === 'local' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              boxShadow: sourceFilter === 'local' ? 'var(--shadow-subtle)' : 'none'
            }}
          >
            Local Projects ({localCount})
          </button>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginRight: 2 }}>
            Status:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'public', label: 'Public' },
            { id: 'unlisted', label: 'Unlisted' },
            { id: 'private', label: 'Private' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'rendered', label: 'Rendered Masters' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 14,
                fontSize: 11.5,
                fontWeight: 500,
                border: statusFilter === f.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-delicate)',
                background: statusFilter === f.id ? 'var(--accent-gold-light)' : 'transparent',
                color: statusFilter === f.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Content Grid or List */}
      {filteredEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Film size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>No videos match your criteria</h3>
          <p style={{ fontSize: 13 }}>Try clearing filters or search keywords.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20
        }}>
          {filteredEntries.map(entry => {
            const priv = (entry.privacyStatus || '').toLowerCase();
            const isLocal = entry.type !== 'channel_only';

            return (
              <div
                key={entry.id}
                onClick={() => {
                  if (entry.localSlug) {
                    onSelectProject(entry.localSlug);
                  } else if (onSelectVideo && entry.videoId) {
                    onSelectVideo(entry.videoId);
                  }
                }}
                className="anymyn-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border-delicate)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Media Thumbnail Container */}
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  background: '#0D0C0B',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {entry.thumbnail ? (
                    <img
                      src={entry.thumbnail}
                      alt={entry.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Film size={36} color="var(--text-muted)" />
                    </div>
                  )}

                  {/* Top Origin Pill Badge */}
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6 }}>
                    {entry.type === 'local_and_uploaded' && (
                      <span className="badge badge-emerald font-mono" style={{ padding: '2px 8px', fontSize: 10 }}>
                        ANYMYN Master · Uploaded
                      </span>
                    )}
                    {entry.type === 'channel_only' && (
                      <span className="badge font-mono" style={{ padding: '2px 8px', fontSize: 10, background: '#D9534F', color: '#fff' }}>
                        YouTube Channel
                      </span>
                    )}
                    {entry.type === 'local_only' && (
                      <span className="badge badge-gold font-mono" style={{ padding: '2px 8px', fontSize: 10 }}>
                        Local Production
                      </span>
                    )}
                  </div>

                  {/* Bottom Duration Badge */}
                  {entry.durationFormatted && (
                    <span style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.85)',
                      color: '#FAF8F5',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 5px',
                      borderRadius: 3,
                      fontFamily: 'monospace'
                    }}>
                      {entry.durationFormatted}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: 8,
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {entry.title}
                    </h3>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {/* Privacy Status */}
                      {priv === 'public' && (
                        <span className="badge badge-emerald font-mono" style={{ padding: '1px 6px', fontSize: 9.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Globe size={10} /> PUBLIC
                        </span>
                      )}
                      {priv === 'unlisted' && (
                        <span className="badge badge-gold font-mono" style={{ padding: '1px 6px', fontSize: 9.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Share2 size={10} /> UNLISTED
                        </span>
                      )}
                      {priv === 'private' && (
                        <span className="badge font-mono" style={{ padding: '1px 6px', fontSize: 9.5, background: 'var(--bg-wall)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Lock size={10} /> PRIVATE
                        </span>
                      )}
                      {entry.publishAt && (
                        <span className="badge badge-gold font-mono" style={{ padding: '1px 6px', fontSize: 9.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Calendar size={10} /> SCHEDULED
                        </span>
                      )}

                      {entry.videoId && (
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          ID: {entry.videoId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Quick Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-delicate)',
                    fontSize: 11.5,
                    color: 'var(--text-muted)'
                  }}>
                    <span>{entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString() : 'Draft'}</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {entry.videoId && (
                        <a
                          href={`https://youtu.be/${entry.videoId}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: 'var(--text-muted)' }}
                          title="Open on YouTube"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                        Workspace <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="anymyn-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-delicate)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Video</th>
                <th style={{ padding: '12px 16px' }}>Origin</th>
                <th style={{ padding: '12px 16px' }}>Visibility</th>
                <th style={{ padding: '12px 16px' }}>Duration</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => {
                const priv = (entry.privacyStatus || '').toLowerCase();
                return (
                  <tr
                    key={entry.id}
                    onClick={() => {
                      if (entry.localSlug) onSelectProject(entry.localSlug);
                      else if (onSelectVideo && entry.videoId) onSelectVideo(entry.videoId);
                    }}
                    style={{
                      borderBottom: '1px solid var(--border-delicate)',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Video Info */}
                    <td style={{ padding: '12px 16px', minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 60,
                          height: 38,
                          borderRadius: 4,
                          background: '#000',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {entry.thumbnail ? (
                            <img src={entry.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Film size={14} color="#666" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                            {entry.title}
                          </div>
                          {entry.videoId && (
                            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                              {entry.videoId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Origin */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {entry.type === 'local_and_uploaded' && (
                        <span className="badge badge-emerald font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>
                          ANYMYN Master
                        </span>
                      )}
                      {entry.type === 'channel_only' && (
                        <span className="badge font-mono" style={{ padding: '2px 7px', fontSize: 10, background: '#D9534F', color: '#fff' }}>
                          Channel Direct
                        </span>
                      )}
                      {entry.type === 'local_only' && (
                        <span className="badge badge-gold font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>
                          Local Production
                        </span>
                      )}
                    </td>

                    {/* Visibility */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {priv === 'public' && <span className="badge badge-emerald font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>PUBLIC</span>}
                      {priv === 'unlisted' && <span className="badge badge-gold font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>UNLISTED</span>}
                      {priv === 'private' && <span className="badge font-mono" style={{ padding: '2px 7px', fontSize: 10, background: 'var(--bg-wall)', color: 'var(--text-secondary)' }}>PRIVATE</span>}
                      {entry.publishAt && <span className="badge badge-gold font-mono" style={{ padding: '2px 7px', fontSize: 10, marginLeft: 4 }}>SCHEDULED</span>}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {entry.durationFormatted || '—'}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString() : 'Draft'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        {entry.videoId && (
                          <a
                            href={`https://youtu.be/${entry.videoId}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ color: 'var(--text-muted)' }}
                            title="Open on YouTube"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: 12 }}>
                          Open
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
