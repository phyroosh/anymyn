import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  ShieldAlert,
  Copy, 
  Check, 
  RotateCw,
  Trash2,
  Sparkles,
  Lock,
  BarChart3
} from 'lucide-react';

export default function YouTubeSettingsModal({ isOpen, onClose, youtubeAuth, onRefreshAuth, onSyncChannel, isSyncing }) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const redirectUri = 'http://127.0.0.1:4242/api/youtube/oauth/callback';
  const permissions = youtubeAuth?.permissions || {};
  const channel = youtubeAuth?.channel || {};

  // Load existing credentials on modal open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/youtube/credentials')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.success && data.clientId) {
            setClientId(data.clientId);
            if (data.hasSecret) {
              setClientSecret('GOCSPX-••••••••••••••••••••••••••••');
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleSaveCredentials = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setStatusMessage({ type: 'error', text: 'Both Client ID and Client Secret are required.' });
      return;
    }
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/youtube/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId.trim(), clientSecret: clientSecret.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'OAuth Credentials saved securely. Click "Authorize Full Studio Control" to grant channel permissions.' });
        await onRefreshAuth();
      } else {
        setStatusMessage({ type: 'error', text: data.error || `Server returned error (${res.status})` });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to connect to backend server' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectChannel = async () => {
    setStatusMessage(null);
    try {
      const res = await fetch('/api/youtube/auth-url');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=700');
        setStatusMessage({
          type: 'info',
          text: 'Google Authorization tab opened. Select your Google Account and grant YouTube permissions. This window will automatically detect completion.'
        });

        // Poll for callback completion
        const interval = setInterval(async () => {
          const check = await onRefreshAuth();
          if (check?.authenticated) {
            clearInterval(interval);
            setStatusMessage({ type: 'success', text: `Successfully linked YouTube channel: ${check.channel?.title || 'YouTube Channel'}!` });
          }
        }, 2000);

        setTimeout(() => clearInterval(interval), 120000);
      } else {
        setStatusMessage({ type: 'error', text: data.error || `Failed to generate auth URL (${res.status})` });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not connect to authentication endpoint' });
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this YouTube channel?')) return;
    try {
      await fetch('/api/youtube/disconnect', { method: 'POST' });
      await onRefreshAuth();
      setStatusMessage({ type: 'info', text: 'YouTube channel disconnected.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-delicate)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              background: '#12100E',
              flexShrink: 0
            }}>
              <img
                src="/anymyn-logo.jpg"
                alt="ANYMYN Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h2 className="font-cinzel" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                YouTube Studio Hub
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Channel Management Permissions &amp; Desktop OAuth Vault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {statusMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 6,
              marginBottom: 18,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: statusMessage.type === 'success' ? 'var(--accent-emerald-light)' : statusMessage.type === 'error' ? 'var(--accent-crimson-light)' : 'var(--bg-panel)',
              border: `1px solid ${statusMessage.type === 'success' ? 'var(--accent-emerald-border)' : statusMessage.type === 'error' ? '#F5C6C6' : 'var(--border-delicate)'}`,
              color: statusMessage.type === 'success' ? 'var(--accent-emerald)' : statusMessage.type === 'error' ? 'var(--accent-crimson)' : 'var(--text-primary)'
            }}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ACTIVE CHANNEL CARD IF CONNECTED */}
          {youtubeAuth?.authenticated && channel && (
            <div style={{
              padding: 16,
              borderRadius: 8,
              background: 'var(--accent-emerald-light)',
              border: '1px solid var(--accent-emerald-border)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {channel.channelThumbnail || channel.thumbnail ? (
                  <img
                    src={channel.channelThumbnail || channel.thumbnail}
                    alt=""
                    style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #FFFFFF' }}
                  />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                    <Youtube size={22} />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    {channel.channelTitle || channel.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {channel.customUrl || channel.channelId || channel.id} · {Number(channel.subscriberCount || 0).toLocaleString()} subscribers
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {onSyncChannel && (
                  <button
                    onClick={onSyncChannel}
                    disabled={isSyncing}
                    className="btn-outline"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                  >
                    <RotateCw size={12} className={isSyncing ? 'spin-anim' : ''} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                )}
                <button
                  onClick={handleDisconnect}
                  className="btn-outline"
                  style={{ padding: '4px 10px', fontSize: 11, color: 'var(--accent-crimson)' }}
                >
                  <Trash2 size={12} />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}

          {/* PERMISSION TIERS BREAKDOWN */}
          {youtubeAuth?.authenticated && (
            <div style={{
              padding: '14px 16px',
              borderRadius: 8,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-delicate)',
              marginBottom: 20
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                Active Studio Permissions
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {permissions.canUpload ? <CheckCircle2 size={14} color="var(--accent-emerald)" /> : <AlertCircle size={14} color="var(--text-muted)" />}
                  <span style={{ color: permissions.canUpload ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    Video Uploading (<code className="font-mono" style={{ fontSize: 10 }}>youtube.upload</code>)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {permissions.canRead ? <CheckCircle2 size={14} color="var(--accent-emerald)" /> : <AlertCircle size={14} color="var(--text-muted)" />}
                  <span style={{ color: permissions.canRead ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    Channel Read (<code className="font-mono" style={{ fontSize: 10 }}>youtube.readonly</code>)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {permissions.canManage ? <CheckCircle2 size={14} color="var(--accent-emerald)" /> : <ShieldAlert size={14} color="var(--accent-gold)" />}
                  <span style={{ color: permissions.canManage ? 'var(--text-primary)' : 'var(--accent-gold)', fontWeight: permissions.canManage ? 400 : 600 }}>
                    Channel Management (<code className="font-mono" style={{ fontSize: 10 }}>youtube.force-ssl</code>)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {permissions.canAnalytics ? <CheckCircle2 size={14} color="var(--accent-emerald)" /> : <AlertCircle size={14} color="var(--accent-gold)" />}
                  <span style={{ color: permissions.canAnalytics ? 'var(--text-primary)' : 'var(--accent-gold)', fontWeight: permissions.canAnalytics ? 400 : 600 }}>
                    YouTube Analytics (<code className="font-mono" style={{ fontSize: 10 }}>yt-analytics.readonly</code>)
                  </span>
                </div>
              </div>

              {(!permissions.canManage || !permissions.canAnalytics) && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-delicate)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Upgrade permissions to unlock visibility changes, metadata edits, custom thumbnails, and analytics:
                  </span>
                  <button
                    onClick={handleConnectChannel}
                    className="btn-gold"
                    style={{ fontSize: 11.5, padding: '5px 12px' }}
                  >
                    Authorize Studio Management
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OAUTH 2.0 REDIRECT URI & SETUP GUIDE */}
          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Authorized Redirect URI
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-delicate)',
              borderRadius: 6,
              padding: '6px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11
            }}>
              <span>{redirectUri}</span>
              <button
                onClick={handleCopyUri}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--accent-gold)',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                {copiedUri ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedUri ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* CREDENTIALS INPUT FORM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                OAuth Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                placeholder="xxxx.apps.googleusercontent.com"
                className="anymyn-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                OAuth Client Secret
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={e => setClientSecret(e.target.value)}
                placeholder="GOCSPX-xxxx"
                className="anymyn-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
              <button
                onClick={handleSaveCredentials}
                disabled={isSaving || (!clientId.trim() && !clientSecret.trim())}
                className="btn-outline"
                style={{ fontSize: 12 }}
              >
                <Key size={14} />
                <span>Save Credentials</span>
              </button>

              <button
                onClick={handleConnectChannel}
                className="btn-gold"
                style={{ fontSize: 12 }}
              >
                <Youtube size={15} />
                <span>{youtubeAuth?.authenticated ? 'Reconnect / Upgrade Scopes' : 'Authorize Channel'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
