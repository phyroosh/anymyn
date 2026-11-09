import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Check, 
  X, 
  ShieldAlert, 
  UserX, 
  RotateCw, 
  Filter, 
  ThumbsUp, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export default function CommentsView({ 
  youtubeAuth, 
  onOpenYouTubeSettings,
  showToast 
}) {
  const [comments, setComments] = useState([]);
  const [moderationStatus, setModerationStatus] = useState('published'); // 'published' | 'heldForReview'
  const [isLoading, setIsLoading] = useState(false);
  const [replyTextMap, setReplyTextMap] = useState({}); // commentId -> text
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [banConfirmTarget, setBanConfirmTarget] = useState(null); // commentId

  const permissions = youtubeAuth?.permissions || {};

  const fetchComments = async (status = moderationStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/youtube/comments?moderationStatus=${status}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.threads || []);
      } else if (data.requiresPermissionUpgrade) {
        if (showToast) showToast(data.message, 'error');
        setComments([]);
      } else {
        if (showToast) showToast(data.error || 'Failed to fetch comments', 'error');
        setComments([]);
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(moderationStatus);
  }, [moderationStatus]);

  const handleReply = async (parentId) => {
    const text = replyTextMap[parentId];
    if (!text || !text.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch('/api/youtube/comments/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, text: text.trim() })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Reply published successfully on YouTube', 'success');
        setReplyTextMap(prev => ({ ...prev, [parentId]: '' }));
        setActiveReplyId(null);
        await fetchComments(moderationStatus);
      } else if (data.requiresPermissionUpgrade) {
        if (showToast) showToast(data.message, 'error');
        onOpenYouTubeSettings();
      } else {
        if (showToast) showToast(data.error || 'Failed to send reply', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const handleModerate = async (commentId, actionStatus, banAuthor = false) => {
    try {
      const res = await fetch('/api/youtube/comments/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, moderationStatus: actionStatus, banAuthor })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(`Comment ${actionStatus === 'published' ? 'approved' : 'rejected'}${banAuthor ? ' (Author banned)' : ''}`, 'success');
        setBanConfirmTarget(null);
        await fetchComments(moderationStatus);
      } else {
        if (showToast) showToast(data.error || 'Moderation action failed', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: '1px solid var(--border-delicate)'
      }}>
        <div>
          <h1 className="font-cinzel" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Community Comments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Interact with your channel audience and moderate discussion threads.
          </p>
        </div>

        {/* Status Filters & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-delicate)',
            borderRadius: 6,
            padding: 2
          }}>
            <button
              onClick={() => setModerationStatus('published')}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: moderationStatus === 'published' ? 'var(--bg-surface)' : 'transparent',
                color: moderationStatus === 'published' ? 'var(--accent-gold)' : 'var(--text-muted)',
                boxShadow: moderationStatus === 'published' ? 'var(--shadow-subtle)' : 'none'
              }}
            >
              Published
            </button>
            <button
              onClick={() => setModerationStatus('heldForReview')}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: moderationStatus === 'heldForReview' ? 'var(--bg-surface)' : 'transparent',
                color: moderationStatus === 'heldForReview' ? 'var(--accent-gold)' : 'var(--text-muted)',
                boxShadow: moderationStatus === 'heldForReview' ? 'var(--shadow-subtle)' : 'none'
              }}
            >
              Held for Review
            </button>
          </div>

          <button
            onClick={() => fetchComments(moderationStatus)}
            disabled={isLoading}
            className="btn-outline"
            style={{ padding: '6px 10px', fontSize: 12 }}
            title="Refresh comments"
          >
            <RotateCw size={13} className={isLoading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* Permission alert if moderation status requires force-ssl */}
      {!permissions.canManage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: 'var(--accent-gold-light)',
          border: '1px solid var(--accent-gold-border)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: 12.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={16} color="var(--accent-gold)" />
            <span>Replying to comments or moderating held comments requires the <strong>Channel Management (force-ssl)</strong> permission.</span>
          </div>
          <button onClick={onOpenYouTubeSettings} className="btn-primary" style={{ padding: '4px 10px', fontSize: 11 }}>
            Authorize
          </button>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <RotateCw size={24} className="spin-anim" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12.5 }}>Loading channel comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="anymyn-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
            No comments in {moderationStatus === 'published' ? 'Published' : 'Held for Review'}
          </h3>
          <p style={{ fontSize: 13 }}>
            {moderationStatus === 'published' 
              ? 'When viewers leave comments on your public videos, they will appear here.'
              : 'No comments currently require moderation.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {comments.map(thread => (
            <div
              key={thread.id}
              className="anymyn-card"
              style={{ padding: '20px', background: 'var(--bg-surface)' }}
            >
              {/* Comment Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={thread.authorProfileImageUrl || '/anymyn-logo.jpg'}
                    alt=""
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                      {thread.authorDisplayName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(thread.publishedAt).toLocaleString()} · Video: <code className="font-mono">{thread.videoId}</code>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {thread.likeCount > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <ThumbsUp size={12} /> {thread.likeCount}
                    </span>
                  )}
                  <a
                    href={`https://youtu.be/${thread.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--text-muted)' }}
                    title="View on YouTube"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Comment Text */}
              <div style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 14 }}
                   dangerouslySetInnerHTML={{ __html: thread.textDisplay }}
              />

              {/* Action Buttons: Reply, Approve, Reject */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <button
                  onClick={() => setActiveReplyId(activeReplyId === thread.id ? null : thread.id)}
                  className="btn-outline"
                  style={{ padding: '4px 10px', fontSize: 11.5 }}
                >
                  Reply
                </button>

                {moderationStatus === 'heldForReview' && (
                  <>
                    <button
                      onClick={() => handleModerate(thread.id, 'published')}
                      className="btn-primary"
                      style={{ padding: '4px 10px', fontSize: 11.5 }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(thread.id, 'rejected')}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-crimson)',
                        color: 'var(--accent-crimson)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 11.5,
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

              {/* Inline Reply Form */}
              {activeReplyId === thread.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-delicate)' }}>
                  <textarea
                    rows={2}
                    placeholder="Write a public reply..."
                    value={replyTextMap[thread.id] || ''}
                    onChange={e => setReplyTextMap({ ...replyTextMap, [thread.id]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border-input)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: 8
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="btn-outline"
                      style={{ fontSize: 11.5, padding: '4px 10px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(thread.id)}
                      disabled={isReplying || !replyTextMap[thread.id]?.trim()}
                      className="btn-primary"
                      style={{ fontSize: 11.5, padding: '4px 12px' }}
                    >
                      {isReplying ? 'Publishing...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
