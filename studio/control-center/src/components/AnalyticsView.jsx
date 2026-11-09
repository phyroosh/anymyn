import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Download, 
  RotateCw, 
  ExternalLink,
  ShieldAlert,
  Info,
  Calendar,
  Eye,
  Percent
} from 'lucide-react';

export default function AnalyticsView({ 
  youtubeAuth, 
  onOpenYouTubeSettings,
  showToast 
}) {
  const [range, setRange] = useState('28d'); // '7d' | '28d' | '90d' | '365d' | 'lifetime'
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async (selectedRange = range) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/youtube/analytics?range=${selectedRange}`);
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        if (showToast) showToast(data.error || 'Failed to fetch analytics', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const handleExportCSV = () => {
    window.location.href = `/api/youtube/analytics/export?range=${range}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatHours = (minutes) => {
    if (!minutes) return '0.0 hrs';
    return `${(minutes / 60).toFixed(1)} hrs`;
  };

  // If Analytics permission is not yet authorized
  if (report && !report.available && report.requiresPermissionUpgrade) {
    return (
      <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 24px' }}>
        <div className="anymyn-card" style={{ padding: '40px 32px', textAlign: 'center', background: 'var(--bg-surface)' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--accent-gold-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--accent-gold)'
          }}>
            <BarChart3 size={28} />
          </div>
          <h2 className="font-cinzel" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            YouTube Analytics Authorization
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.5 }}>
            To inspect views, watch time, audience retention metrics, and subscriber growth directly inside ANYMYN Studio, 
            Google requires the <code className="font-mono">yt-analytics.readonly</code> permission scope.
          </p>

          <div style={{
            padding: '14px 18px',
            borderRadius: 8,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-delicate)',
            maxWidth: 520,
            margin: '0 auto 24px',
            fontSize: 12,
            textAlign: 'left',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Principle of Least Privilege:
            </div>
            • Read-only access to channel performance reports.<br />
            • No access to financial, monetization, or revenue data.<br />
            • Tokens remain strictly stored on your local machine.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={onOpenYouTubeSettings}
              className="btn-primary"
              style={{ fontSize: 13, padding: '10px 22px' }}
            >
              Authorize YouTube Analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totals = report?.totals || {
    views: 0,
    estimatedMinutesWatched: 0,
    averageViewDurationSeconds: 0,
    averageViewPercentage: 0,
    subscribersGained: 0,
    likes: 0,
    comments: 0,
    shares: 0
  };

  const topVideos = report?.topVideos || [];

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
            Channel Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Official YouTube Analytics API reports for <strong>{youtubeAuth?.channel?.channelTitle || 'Finance Sensei'}</strong>.
          </p>
        </div>

        {/* Date Range Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-delicate)',
            borderRadius: 6,
            padding: 2
          }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '28d', label: '28 Days' },
              { id: '90d', label: '90 Days' },
              { id: '365d', label: '365 Days' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: range === r.id ? 'var(--bg-surface)' : 'transparent',
                  color: range === r.id ? 'var(--accent-gold)' : 'var(--text-muted)',
                  boxShadow: range === r.id ? 'var(--shadow-subtle)' : 'none'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(range)}
            disabled={isLoading}
            className="btn-outline"
            style={{ padding: '6px 10px', fontSize: 12 }}
            title="Refresh analytics data"
          >
            <RotateCw size={13} className={isLoading ? 'spin-anim' : ''} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!report?.available || topVideos.length === 0}
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 28
      }}>
        {/* Total Views */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Views
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--bg-wall)', color: 'var(--text-secondary)' }}>
              <Eye size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
            {totals.views.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            In selected {range}
          </div>
        </div>

        {/* Watch Time */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Watch Time
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
              <Clock size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-gold)' }}>
            {formatHours(totals.estimatedMinutesWatched)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {(totals.estimatedMinutesWatched || 0).toFixed(0)} total minutes
          </div>
        </div>

        {/* Average View Duration */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg View Duration
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {formatDuration(totals.averageViewDurationSeconds)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Retention anchor
          </div>
        </div>

        {/* Average View Percentage */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Percentage Viewed
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--bg-wall)', color: 'var(--text-secondary)' }}>
              <Percent size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
            {(totals.averageViewPercentage || 0).toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Relative completion rate
          </div>
        </div>

        {/* Subscribers Gained */}
        <div className="anymyn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Subscribers Gained
            </span>
            <div style={{ padding: 5, borderRadius: 6, background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
              <Users size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-gold)' }}>
            +{totals.subscribersGained}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Net growth
          </div>
        </div>
      </div>

      {/* Video Performance Table */}
      <div className="anymyn-card" style={{ padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Video Performance Breakdown
          </h2>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Showing {topVideos.length} videos
          </span>
        </div>

        {topVideos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
            <BarChart3 size={36} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p style={{ fontSize: 13, marginBottom: 4 }}>No video viewership recorded for this period yet.</p>
            <p style={{ fontSize: 11.5 }}>YouTube Analytics updates daily with approximately 24-48 hours latency.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-delicate)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 14px' }}>Video</th>
                <th style={{ padding: '10px 14px' }}>Views</th>
                <th style={{ padding: '10px 14px' }}>Watch Time (hrs)</th>
                <th style={{ padding: '10px 14px' }}>Avg Duration</th>
                <th style={{ padding: '10px 14px' }}>Avg View %</th>
                <th style={{ padding: '10px 14px' }}>Likes</th>
              </tr>
            </thead>
            <tbody>
              {topVideos.map(v => (
                <tr key={v.video} style={{ borderBottom: '1px solid var(--border-delicate)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 50,
                        height: 32,
                        borderRadius: 4,
                        background: '#000',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {v.thumbnail ? (
                          <img src={v.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Film size={12} color="#666" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.title}</div>
                        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.video}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{(v.views || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{((v.estimatedMinutesWatched || 0) / 60).toFixed(1)}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{formatDuration(v.averageViewDuration)}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {(v.averageViewPercentage || 0).toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{v.likes || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* API Honesty & Transparency Notice */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 8,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-delicate)',
        fontSize: 12,
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}>
        <Info size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ color: 'var(--text-secondary)' }}>YouTube Analytics API Scope Note:</strong> The public YouTube Analytics API exposes official aggregate metrics (views, watch time, average view duration, average view percentage, and subscriber changes). Continuous second-by-second drop-off curve visualizations remain proprietary to the internal YouTube Studio web console.
        </div>
      </div>
    </div>
  );
}
