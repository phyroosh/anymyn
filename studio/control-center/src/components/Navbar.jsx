import React from 'react';
import { 
  Film, 
  LayoutDashboard, 
  Library, 
  Youtube, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Sun,
  Moon,
  ListVideo,
  BarChart3,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  youtubeAuth, 
  onOpenYouTubeSettings, 
  onSyncChannel,
  isSyncing,
  lastSyncedAt,
  scheduledCount = 0,
  theme = 'light',
  onToggleTheme
}) {
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Never';
    const elapsedSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (elapsedSec < 60) return 'Just now';
    if (elapsedSec < 3600) return `${Math.floor(elapsedSec / 60)}m ago`;
    if (elapsedSec < 86400) return `${Math.floor(elapsedSec / 3600)}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'library', label: 'Video Library', icon: Library },
    { id: 'schedule', label: 'Schedule', icon: Calendar, badge: scheduledCount > 0 ? scheduledCount : null },
    { id: 'playlists', label: 'Playlists', icon: ListVideo },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'workspace', label: 'Workspace', icon: Film }
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-delicate)',
      background: 'var(--bg-navbar)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 24px',
      transition: 'background-color 0.25s ease'
    }}>
      <div style={{
        maxWidth: 1600,
        margin: '0 auto',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Brand identity */}
        <div 
          onClick={() => setCurrentTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25), 0 0 0 1px var(--border-delicate)',
            background: '#12100E',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src="/anymyn-logo.jpg"
              alt="ANYMYN Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                ANYMYN
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Studio
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
              YouTube Control Center
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 11px',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 500,
                  background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="badge badge-gold font-mono" style={{ padding: '0px 5px', fontSize: 10 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Sync Channel + Theme Toggle + YouTube Auth Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Channel Sync button */}
          <button
            onClick={onSyncChannel}
            disabled={isSyncing}
            title={lastSyncedAt ? `Last synchronized: ${formatTimeAgo(lastSyncedAt)} (Click to sync now)` : 'Synchronize channel with YouTube'}
            className="btn-outline"
            style={{ 
              padding: '6px 10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              fontSize: 11.5,
              fontWeight: 500
            }}
          >
            <RotateCw size={13} className={isSyncing ? 'spin-anim' : ''} color="var(--accent-gold)" />
            <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            {lastSyncedAt && !isSyncing && (
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                · {formatTimeAgo(lastSyncedAt)}
              </span>
            )}
          </button>

          {/* Theme switcher button */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
            className="btn-outline"
            style={{ padding: '6px 9px', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {theme === 'dark' ? (
              <Sun size={14} color="var(--accent-gold)" />
            ) : (
              <Moon size={14} color="var(--text-secondary)" />
            )}
          </button>

          {/* YouTube Connection Status Pill */}
          <button
            onClick={onOpenYouTubeSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              background: youtubeAuth?.authenticated ? 'var(--accent-emerald-light)' : 'var(--accent-gold-light)',
              border: `1px solid ${youtubeAuth?.authenticated ? 'var(--accent-emerald-border)' : 'var(--accent-gold-border)'}`,
              color: youtubeAuth?.authenticated ? 'var(--accent-emerald)' : 'var(--accent-gold)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Youtube size={15} color={youtubeAuth?.authenticated ? 'var(--accent-emerald)' : 'var(--accent-gold)'} />
            {youtubeAuth?.authenticated ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} />
                <span>{youtubeAuth?.channel?.channelTitle || youtubeAuth?.channel?.title || 'YouTube Linked'}</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} />
                <span>Connect YouTube</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
