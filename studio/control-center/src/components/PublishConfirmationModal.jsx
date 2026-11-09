import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Check, X, Youtube } from 'lucide-react';

export default function PublishConfirmationModal({ isOpen, onClose, onConfirm, project, formData }) {
  const [hasConfirmedChecks, setHasConfirmedChecks] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Warning Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-delicate)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--accent-crimson-light)'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--accent-crimson)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-crimson)' }}>
              Confirm Public Video Release
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Safety invariant check before launching to YouTube
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 16 }}>
            You are about to publish <strong>"{formData.title || project.title}"</strong> directly to YouTube with 
            <span style={{ color: 'var(--accent-crimson)', fontWeight: 700 }}> PUBLIC</span> visibility.
          </p>

          <div style={{
            padding: 14,
            borderRadius: 6,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-delicate)',
            fontSize: 12,
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Project Slug:</span>
              <span className="font-mono">{project.slug}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Resolution:</span>
              <span className="font-mono">1080 × 1920 (Vertical)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Visibility:</span>
              <span style={{ color: 'var(--accent-crimson)', fontWeight: 700 }}>PUBLIC (Instant Worldwide Access)</span>
            </div>
          </div>

          {/* Verification Checkbox */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            padding: '10px 12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-delicate)',
            borderRadius: 6
          }}>
            <input
              type="checkbox"
              checked={hasConfirmedChecks}
              onChange={e => setHasConfirmedChecks(e.target.checked)}
              style={{ marginTop: 2, accentColor: 'var(--accent-crimson)' }}
            />
            <span>
              I have inspected the master video render, verified that the audio is clear and normalized, 
              checked that financial calculations are accurate, and approve this video for immediate public distribution.
            </span>
          </label>
        </div>

        {/* Modal Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-delicate)',
          background: 'var(--bg-panel)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10
        }}>
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirm();
            }}
            disabled={!hasConfirmedChecks}
            className="btn-primary"
            style={{
              background: hasConfirmedChecks ? 'var(--accent-crimson)' : '#A0998F',
              borderColor: hasConfirmedChecks ? '#9E2D2D' : '#A0998F'
            }}
          >
            <Youtube size={15} />
            <span>Confirm &amp; Publish PUBLIC</span>
          </button>
        </div>
      </div>
    </div>
  );
}
