import React from 'react';
import { 
  Film, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Youtube, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  ExternalLink,
  Layers,
  ChevronRight,
  Eye,
  Lock,
  Globe,
  Share2,
  Calendar,
  RotateCw,
  ShieldCheck,
  ShieldAlert,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

export default function DashboardView({ 
  overview, 
  projects, 
  channelVideos = [],
  youtubeAuth,
  onSelectProject, 
  onSelectVideo,
  onNavigateTab,
  onOpenYouTubeSettings,
  onSyncChannel,
  isSyncing
}) {
  const stats = overview?.stats || {
    totalProjects: projects.length,
    renderedProjects: projects.filter(p => p.hasRenderedVideo).length,
    totalDurationSeconds: 0,
    totalSizeBytes: 0
  };

  const channel = youtubeAuth?.channel || overview?.syncState || {};
  const youtubeStats = overview?.youtubeStats || {
    totalVideos: channelVideos.length,
    publicVideos: channelVideos.filter(v => v.privacy_status === 'public').length,
    unlistedVideos: channelVideos.filter(v => v.privacy_status === 'unlisted').length,
    privateVideos: channelVideos.filter(v => v.privacy_status === 'private' && !v.publish_at).length,
    scheduledVideos: channelVideos.filter(v => v.privacy_status === 'scheduled' || !!v.publish_at).length,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  };

  const permissions = youtubeAuth?.permissions || overview?.permissions || {};
  const recentActivity = overview?.recentActivity || [];
  const recentAudit = overview?.recentAudit || [];

  const formatSeconds = (sec) => {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Never';
    const elapsedSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (elapsedSec < 60) return 'Just now';
    if (elapsedSec < 3600) return `${Math.floor(elapsedSec / 60)}m ago`;
    if (elapsedSec < 86400) return `${Math.floor(elapsedSec / 3600)}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Channel Header Monolith */}
      <div className="anymyn-card" style={{
        padding: '24px 28px',
        marginBottom: 28,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-delicate)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}>
          {/* Channel Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 0 0 2px var(--border-delicate)',
              background: '#12100E',
              flexShrink: 0
            }}>
              <img
                src={channel.channelThumbnail || channel.thumbnail || '/anymyn-logo.jpg'}
                alt="Channel Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h1 className="font-cinzel" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {channel.channelTitle || channel.title || 'Finance Sensei'}
                </h1>
                {youtubeAuth?.authenticated && (
                  <span className="badge badge-emerald font-mono" style={{ padding: '2px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={11} /> Verified Channel
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                {channel.customUrl && (
                  <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {channel.customUrl}
                  </span>
                )}
                <span>Channel ID: <code className="font-mono" style={{ fontSize: 11 }}>{channel.channelId || channel.id || 'UCErtMW3bYySt662FiE0R3eQ'}</code></span>
                <span>·</span>
                <span>Subscribers: <strong style={{ color: 'var(--text-secondary)' }}>{channel.subscriberCount || '0'}</strong></span>
                <span>·</span>
                <span>Total Views: <strong style={{ color: 'var(--text-secondary)' }}>{channel.totalViews || '0'}</strong></span>
              </div>
            </div>
          </div>

          {/* Sync & Settings Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onSyncChannel}
              disabled={isSyncing}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12.5 }}
            >
              <RotateCw size={14} className={isSyncing ? 'spin-anim' : ''} color="var(--accent-gold)" />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Channel'}</span>
            </button>
            <button
              onClick={onOpenYouTubeSettings}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', fontSize: 12.5 }}
            >
              <Youtube size={15} color="#C58A35" />
              <span>Channel Settings</span>
            </button>
          </div>
        </div>

        {/* Permission Upgrade Banner if management permissions not yet authorized */}
        {youtubeAuth?.authenticated && !permissions.canManage && (
          <div style={{
            marginTop: 18,
            padding: '12px 16px',
            borderRadius: 8,
            background: 'var(--accent-gold-light)',
            border: '1px solid var(--accent-gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={18} color="var(--accent-gold)" />
              <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
                <strong>Limited Read/Upload Mode:</strong> Direct channel management (changing visibility, editing metadata, replacing thumbnails, or managing playlists) requires the <code className="font-mono">youtube.force-ssl</code> scope.
              </span>
            </div>
            <button
              onClick={onOpenYouTubeSettings}
              className="btn-primary"
              style={{ padding: '5px 12px', fontSize: 11.5, whiteSpace: 'nowrap' }}
            >
              Authorize Studio Control
            </button>
          </div>
        )}
      </div>

      {/* Primary Channel KPI Cards (Zero Fabrication, Exact API Data) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 14,
        marginBottom: 28
      }}>
        {/* Total Uploaded Videos */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Channel Videos
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--bg-wall)', color: 'var(--text-secondary)' }}>
              <Youtube size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            {youtubeStats.totalVideos}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Synchronized from channel
          </div>
        </div>

        {/* Public Videos */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Public Releases
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
              <Globe size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {youtubeStats.publicVideos}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Publicly viewable
          </div>
        </div>

        {/* Unlisted Videos */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Unlisted Videos
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
              <Share2 size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-gold)' }}>
            {youtubeStats.unlistedVideos}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Accessible via direct link
          </div>
        </div>

        {/* Private Videos */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Private Vault
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--bg-wall)', color: 'var(--text-secondary)' }}>
              <Lock size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            {youtubeStats.privateVideos}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Strict channel-only visibility
          </div>
        </div>

        {/* Scheduled Publications */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Scheduled Releases
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
              <Calendar size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-gold)' }}>
            {youtubeStats.scheduledVideos}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Pending automatic release
          </div>
        </div>
      </div>

      {/* Main Grid: Channel Videos vs Local Production Engine */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Left Column: Recent Channel Videos Table */}
        <div className="anymyn-card" style={{ padding: '24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                Channel Video Entries
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Real videos discovered on <strong>{channel.channelTitle || 'Finance Sensei'}</strong>. Click any video to open its workspace.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('library')}
              className="btn-outline"
              style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {channelVideos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Youtube size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: 13, marginBottom: 8 }}>No synchronized channel videos yet.</p>
              <button onClick={onSyncChannel} className="btn-outline" style={{ fontSize: 12 }}>
                Click to Synchronize Channel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {channelVideos.slice(0, 5).map(video => {
                const isLocalLinked = !video.is_channel_only && video.local_project_slug;
                const priv = (video.privacy_status || 'private').toLowerCase();

                return (
                  <div
                    key={video.video_id}
                    onClick={() => {
                      if (isLocalLinked) {
                        onSelectProject(video.local_project_slug);
                      } else if (onSelectVideo) {
                        onSelectVideo(video.video_id);
                      } else {
                        onNavigateTab('library');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-delicate)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      gap: 14
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                      {/* Video Thumbnail */}
                      <div style={{
                        width: 76,
                        height: 48,
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: '#000',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Film size={18} color="#666" />
                          </div>
                        )}
                        {video.duration && (
                          <span style={{
                            position: 'absolute',
                            bottom: 2,
                            right: 3,
                            background: 'rgba(0,0,0,0.8)',
                            color: '#fff',
                            fontSize: 9,
                            padding: '1px 3px',
                            borderRadius: 2,
                            fontFamily: 'monospace'
                          }}>
                            {video.duration.replace('PT', '').replace('S', 's').replace('M', 'm ')}
                          </span>
                        )}
                      </div>

                      {/* Video Details */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {video.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                          <span className="font-mono">ID: {video.video_id}</span>
                          <span>·</span>
                          {isLocalLinked ? (
                            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                              ANYMYN Master ({video.local_project_slug})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>
                              Channel Direct
                            </span>
                          )}
                          <span>·</span>
                          <span>{video.published_at ? new Date(video.published_at).toLocaleDateString() : 'Draft'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      {priv === 'public' && (
                        <span className="badge badge-emerald font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>
                          PUBLIC
                        </span>
                      )}
                      {priv === 'unlisted' && (
                        <span className="badge badge-gold font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>
                          UNLISTED
                        </span>
                      )}
                      {priv === 'private' && (
                        <span className="badge font-mono" style={{ padding: '2px 7px', fontSize: 10, background: 'var(--bg-wall)', color: 'var(--text-secondary)' }}>
                          PRIVATE
                        </span>
                      )}
                      {video.publish_at && (
                        <span className="badge badge-gold font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>
                          SCHEDULED
                        </span>
                      )}

                      <a
                        href={`https://youtu.be/${video.video_id}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        title="Open on YouTube"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Local Production Studio Summary & Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Local Pipeline Summary */}
          <div className="anymyn-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span className="font-cinzel" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Local Pipeline
              </span>
              <span style={{ fontSize: 11, color: 'var(--accent-gold)', fontWeight: 600 }}>
                {stats.renderedProjects} / {stats.totalProjects} Rendered
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Discovered Projects:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{stats.totalProjects}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Rendered Master Videos:</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>{stats.renderedProjects}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Total Render Duration:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formatSeconds(stats.totalDurationSeconds)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Database Engine:</span>
                <strong style={{ color: 'var(--text-secondary)' }}>SQLite Native</strong>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('library')}
              className="btn-outline"
              style={{ width: '100%', marginTop: 16, fontSize: 12, justifyContent: 'center' }}
            >
              <span>Explore Video Library</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Recent Audit Operations */}
          <div className="anymyn-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="font-cinzel" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Studio Operations Ledger
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Audit Log
              </span>
            </div>

            {recentAudit.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No recent YouTube operations logged yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentAudit.slice(0, 4).map((audit, idx) => (
                  <div key={audit.id || idx} style={{
                    fontSize: 11.5,
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: 'var(--bg-wall)',
                    border: '1px solid var(--border-delicate)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {audit.operation_type.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {formatTimeAgo(audit.created_at)}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {audit.details || audit.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
