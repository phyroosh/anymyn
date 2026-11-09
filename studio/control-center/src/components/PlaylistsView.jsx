import React, { useState, useEffect } from 'react';
import { 
  ListVideo, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Play, 
  Film, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw,
  FolderPlus,
  X,
  Globe,
  Lock,
  Share2
} from 'lucide-react';

export default function PlaylistsView({ 
  channelVideos = [], 
  youtubeAuth, 
  onOpenYouTubeSettings,
  showToast 
}) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrivacy, setNewPrivacy] = useState('public');
  const [isCreating, setIsCreating] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [deleteItemTarget, setDeleteItemTarget] = useState(null); // { playlistItemId, title, videoId }
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch playlists
  const loadPlaylists = async (force = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/youtube/playlists${force ? '?force=true' : ''}`);
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.playlists || []);
        if (data.playlists?.length > 0 && !selectedPlaylist) {
          selectPlaylist(data.playlists[0]);
        }
      } else {
        if (showToast) showToast(data.error || 'Failed to load playlists', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  // Select playlist and fetch its items
  const selectPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    setIsLoadingItems(true);
    try {
      const res = await fetch(`/api/youtube/playlists/${playlist.playlist_id}/items`);
      const data = await res.json();
      if (data.success) {
        setPlaylistItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load playlist items:', err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Create playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/youtube/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          privacyStatus: newPrivacy
        })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(`Playlist "${newTitle}" created successfully`, 'success');
        setIsCreateOpen(false);
        setNewTitle('');
        setNewDescription('');
        await loadPlaylists(true);
        if (data.playlist) selectPlaylist(data.playlist);
      } else if (data.requiresPermissionUpgrade) {
        if (showToast) showToast(data.message, 'error');
        onOpenYouTubeSettings();
      } else {
        if (showToast) showToast(data.error || 'Failed to create playlist', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Add video to playlist
  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!selectedPlaylist || !selectedVideoId) return;

    setIsAdding(true);
    try {
      const res = await fetch(`/api/youtube/playlists/${selectedPlaylist.playlist_id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: selectedVideoId })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Video added to playlist', 'success');
        setIsAddOpen(false);
        setSelectedVideoId('');
        await selectPlaylist(selectedPlaylist);
      } else if (data.requiresPermissionUpgrade) {
        if (showToast) showToast(data.message, 'error');
        onOpenYouTubeSettings();
      } else {
        if (showToast) showToast(data.error || 'Failed to add video', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // Remove video from playlist
  const handleRemoveItem = async () => {
    if (!deleteItemTarget || !selectedPlaylist) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/youtube/playlists/items/${deleteItemTarget.playlistItemId}?playlistId=${selectedPlaylist.playlist_id}&videoId=${deleteItemTarget.videoId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Video removed from playlist (channel video remains safe)', 'success');
        setDeleteItemTarget(null);
        await selectPlaylist(selectedPlaylist);
      } else if (data.requiresPermissionUpgrade) {
        if (showToast) showToast(data.message, 'error');
        onOpenYouTubeSettings();
      } else {
        if (showToast) showToast(data.error || 'Failed to remove item', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28,
        paddingBottom: 20,
        borderBottom: '1px solid var(--border-delicate)'
      }}>
        <div>
          <h1 className="font-cinzel" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Channel Playlists
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Organize channel videos into curated playlists directly on YouTube.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => loadPlaylists(true)}
            disabled={isLoading}
            className="btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
          >
            <RotateCw size={13} className={isLoading ? 'spin-anim' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
          >
            <Plus size={15} />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Playlist List */}
        <div className="anymyn-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, padding: '0 4px' }}>
            Your Playlists ({playlists.length})
          </div>

          {playlists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)' }}>
              <ListVideo size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: 12 }}>No playlists found on your channel.</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="btn-outline"
                style={{ marginTop: 12, fontSize: 11.5 }}
              >
                Create First Playlist
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {playlists.map(pl => {
                const isSelected = selectedPlaylist?.playlist_id === pl.playlist_id;
                return (
                  <div
                    key={pl.playlist_id}
                    onClick={() => selectPlaylist(pl)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 6,
                      background: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--accent-gold)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)', marginBottom: 4 }}>
                      {pl.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{pl.item_count || 0} videos</span>
                      <span className="badge font-mono" style={{ fontSize: 9.5, padding: '1px 5px', textTransform: 'uppercase' }}>
                        {pl.privacy_status || 'public'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Playlist Details & Items */}
        <div>
          {selectedPlaylist ? (
            <div className="anymyn-card" style={{ padding: '24px' }}>
              {/* Playlist Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                paddingBottom: 20,
                marginBottom: 20,
                borderBottom: '1px solid var(--border-delicate)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h2 className="font-cinzel" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedPlaylist.title}
                    </h2>
                    <span className="badge badge-gold font-mono" style={{ padding: '2px 7px', fontSize: 10 }}>
                      {selectedPlaylist.privacy_status?.toUpperCase() || 'PUBLIC'}
                    </span>
                  </div>
                  {selectedPlaylist.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 650, marginBottom: 8 }}>
                      {selectedPlaylist.description}
                    </p>
                  )}
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="font-mono">ID: {selectedPlaylist.playlist_id}</span>
                    <span>·</span>
                    <span>{playlistItems.length} videos inside</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a
                    href={`https://www.youtube.com/playlist?list=${selectedPlaylist.playlist_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline"
                    style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>View on YouTube</span>
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="btn-primary"
                    style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={14} />
                    <span>Add Video</span>
                  </button>
                </div>
              </div>

              {/* Playlist Items List */}
              {isLoadingItems ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <RotateCw size={24} className="spin-anim" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12 }}>Loading playlist videos...</p>
                </div>
              ) : playlistItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  <Film size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <h3 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>This playlist is empty</h3>
                  <p style={{ fontSize: 12.5, marginBottom: 14 }}>Add existing channel videos to start curating.</p>
                  <button onClick={() => setIsAddOpen(true)} className="btn-primary" style={{ fontSize: 12 }}>
                    Add Video to Playlist
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {playlistItems.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 6,
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border-delicate)',
                        gap: 14
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>
                          #{idx + 1}
                        </span>
                        <div style={{
                          width: 64,
                          height: 40,
                          borderRadius: 4,
                          background: '#000',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Film size={14} color="#666" />
                            </div>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            Video ID: {item.video_id}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <a
                          href={`https://youtu.be/${item.video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--text-muted)' }}
                          title="Open on YouTube"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => setDeleteItemTarget({ playlistItemId: item.id, title: item.title, videoId: item.video_id })}
                          title="Remove from playlist"
                          style={{ background: 'none', border: 'none', color: 'var(--accent-crimson)', cursor: 'pointer', padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="anymyn-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ListVideo size={44} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>No Playlist Selected</h3>
              <p style={{ fontSize: 13 }}>Select a playlist from the list on the left to inspect and manage its entries.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {isCreateOpen && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                Create New Playlist
              </h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Playlist Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Personal Finance Deep Dives"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-input)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: 13
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain what this playlist covers..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-input)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Privacy
                </label>
                <select
                  value={newPrivacy}
                  onChange={e => setNewPrivacy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-input)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: 13
                  }}
                >
                  <option value="public">Public (Anyone can view)</option>
                  <option value="unlisted">Unlisted (Anyone with link)</option>
                  <option value="private">Private (Only you)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-outline"
                  style={{ fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="btn-primary"
                  style={{ fontSize: 12.5 }}
                >
                  {isCreating ? 'Creating on YouTube...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {isAddOpen && (
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
          <div className="anymyn-card" style={{ maxWidth: 500, width: '100%', padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                Add Video to "{selectedPlaylist?.title}"
              </h3>
              <button onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVideo} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Choose Channel Video
                </label>
                <select
                  required
                  value={selectedVideoId}
                  onChange={e => setSelectedVideoId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-input)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: 13
                  }}
                >
                  <option value="">Select a video...</option>
                  {channelVideos.map(v => (
                    <option key={v.video_id} value={v.video_id}>
                      {v.title} ({v.privacy_status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-outline"
                  style={{ fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !selectedVideoId}
                  className="btn-primary"
                  style={{ fontSize: 12.5 }}
                >
                  {isAdding ? 'Adding to YouTube...' : 'Add to Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal (Explicit Invariant: Video remains safe on channel) */}
      {deleteItemTarget && (
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
          <div className="anymyn-card" style={{ maxWidth: 460, width: '100%', padding: '28px', background: 'var(--bg-surface)' }}>
            <h3 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Remove from Playlist?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>"{deleteItemTarget.title}"</strong> from the playlist <strong>"{selectedPlaylist?.title}"</strong>?
            </p>
            <div style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: 'var(--accent-emerald-light)',
              border: '1px solid var(--accent-emerald-border)',
              fontSize: 12,
              color: 'var(--accent-emerald)',
              marginBottom: 20
            }}>
              ✓ <strong>Safety invariant:</strong> The video will <strong>NOT</strong> be deleted from your channel. It will only be removed from this playlist.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteItemTarget(null)}
                className="btn-outline"
                style={{ fontSize: 12.5 }}
              >
                Keep in Playlist
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleRemoveItem}
                style={{
                  background: 'var(--accent-crimson)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isDeleting ? 'Removing...' : 'Remove Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
