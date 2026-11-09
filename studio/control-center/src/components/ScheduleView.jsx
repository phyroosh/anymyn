import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Youtube, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink, 
  Film, 
  RotateCw, 
  Sliders, 
  X, 
  ChevronRight, 
  Play, 
  Sparkles, 
  ShieldAlert, 
  Edit3, 
  Trash2,
  Globe
} from 'lucide-react';

export default function ScheduleView({ 
  projects = [], 
  overview, 
  onSelectProject, 
  onNavigateTab,
  youtubeAuth, 
  onOpenYouTubeSettings,
  onRefresh,
  onReschedule,
  onCancelSchedule
}) {
  const [scheduleList, setScheduleList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Reschedule Modal state
  const [rescheduleModalItem, setRescheduleModalItem] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Cancel Confirmation state
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Update real-time clock every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedule from API
  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/youtube/schedule');
      const data = await res.json();
      if (data.success) {
        setScheduleList(data.schedule || []);
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [projects]);

  // Combine DB scheduled list with projects scanned from disk
  const scheduledProjects = projects.filter(p => {
    const meta = p.metadata || {};
    return (
      meta.privacyStatus === 'scheduled' || 
      meta.youtubeStatus === 'scheduled' ||
      (meta.scheduledPublishTime && new Date(meta.scheduledPublishTime) > currentTime)
    );
  });

  // Ready to schedule: rendered videos not yet scheduled or published
  const readyToSchedule = projects.filter(p => {
    if (!p.hasRenderedVideo) return false;
    const meta = p.metadata || {};
    const isLive = meta.youtubeVideoId && (meta.youtubeStatus === 'published' || meta.privacyStatus === 'public');
    const isSched = meta.privacyStatus === 'scheduled' || meta.youtubeStatus === 'scheduled' || meta.scheduledPublishTime;
    return !isLive && !isSched;
  });

  // Previously published videos
  const publishedProjects = projects.filter(p => {
    const meta = p.metadata || {};
    return meta.youtubeVideoId && (meta.youtubeStatus === 'published' || meta.uploadedAt);
  });

  // Helper: Format countdown from now to target ISO time
  const getCountdown = (targetIso) => {
    if (!targetIso) return 'No time set';
    const target = new Date(targetIso);
    const diff = target.getTime() - currentTime.getTime();
    if (diff <= 0) return 'Publishing window reached';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  // Helper: Format localized IST string
  const formatIST = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch {
      return isoString;
    }
  };

  // Helper: Format UTC string
  const formatUTC = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toUTCString().replace('GMT', 'UTC');
    } catch {
      return isoString;
    }
  };

  // Open reschedule modal with initial date/time pre-populated
  const handleOpenReschedule = (item) => {
    setRescheduleModalItem(item);
    setModalError('');
    const publishTime = item.scheduled_publish_time || item.scheduledPublishTime || item.metadata?.scheduledPublishTime;
    if (publishTime) {
      const d = new Date(publishTime);
      // Format as local YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setNewDate(`${year}-${month}-${day}`);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setNewTime(`${hours}:${mins}`);
    } else {
      // Default to tomorrow 18:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      setNewDate(`${year}-${month}-${day}`);
      setNewTime('18:00');
    }
  };

  // Submit Reschedule action
  const handleSubmitReschedule = async () => {
    if (!newDate || !newTime) {
      setModalError('Please select both a date and a time.');
      return;
    }

    const localDateTimeStr = `${newDate}T${newTime}:00`;
    const targetDate = new Date(localDateTimeStr);
    const now = new Date();

    if (targetDate.getTime() - now.getTime() < 10 * 60 * 1000) {
      setModalError('Scheduled release time must be at least 15 minutes in the future.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const slug = rescheduleModalItem.project_slug || rescheduleModalItem.projectSlug || rescheduleModalItem.slug;
      const scheduledPublishTime = targetDate.toISOString();

      if (onReschedule) {
        await onReschedule(slug, scheduledPublishTime, 'Asia/Kolkata');
      } else {
        const res = await fetch(`/api/youtube/schedule/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledPublishTime,
            timezone: 'Asia/Kolkata',
            isMock: !!youtubeAuth?.testMode
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to reschedule');
      }

      setRescheduleModalItem(null);
      await fetchSchedule();
      if (onRefresh) onRefresh();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Cancel Schedule action
  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setIsCancelling(true);
    try {
      const slug = cancelModalItem.project_slug || cancelModalItem.projectSlug || cancelModalItem.slug;
      if (onCancelSchedule) {
        await onCancelSchedule(slug);
      } else {
        const res = await fetch(`/api/youtube/cancel-schedule/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isMock: !!youtubeAuth?.testMode })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to cancel schedule');
      }

      setCancelModalItem(null);
      await fetchSchedule();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  // Find the next upcoming release item
  const allScheduled = [...scheduleList];
  scheduledProjects.forEach(sp => {
    if (!allScheduled.some(s => (s.project_slug || s.projectSlug) === sp.slug)) {
      allScheduled.push({
        project_slug: sp.slug,
        title: sp.metadata?.youtubeTitle || sp.title,
        scheduled_publish_time: sp.metadata?.scheduledPublishTime,
        scheduling_timezone: sp.metadata?.schedulingTimezone || 'Asia/Kolkata',
        youtube_status: 'scheduled'
      });
    }
  });

  // Sort upcoming scheduled by publish time ascending
  allScheduled.sort((a, b) => {
    const tA = new Date(a.scheduled_publish_time || a.scheduledPublishTime || 0).getTime();
    const tB = new Date(b.scheduled_publish_time || b.scheduledPublishTime || 0).getTime();
    return tA - tB;
  });

  const nextRelease = allScheduled[0];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Header Monolith */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: '1px solid var(--border-delicate)',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 16,
            background: 'var(--accent-gold-light)',
            border: '1px solid var(--accent-gold-border)',
            color: 'var(--accent-gold)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            <Calendar size={13} />
            <span>Publishing Timeline</span>
          </div>
          <h1 className="font-cinzel" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            Automated YouTube Releases
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Native YouTube Data API v3 scheduling engine in <strong>Asia/Kolkata (IST · UTC+5:30)</strong>. No local cron required.
          </p>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={fetchSchedule}
            disabled={isLoading}
            className="btn-outline"
            style={{ padding: '8px 14px', fontSize: 13 }}
            title="Refresh schedule from database and YouTube"
          >
            <RotateCw size={14} className={isLoading ? 'spin-anim' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onNavigateTab('workspace')}
            className="btn-gold"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <Film size={15} />
            <span>Schedule from Workspace</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Monoliths */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        {/* Metric 1: Scheduled Count */}
        <div className="anymyn-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Scheduled Releases
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--accent-gold-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}>
              <Calendar size={16} />
            </div>
          </div>
          <div className="font-mono tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            {allScheduled.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Pending automatic publication on YouTube
          </div>
        </div>

        {/* Metric 2: Next Release Countdown */}
        <div className="anymyn-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Next Release In
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: nextRelease ? 'var(--accent-emerald-light)' : 'var(--bg-panel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: nextRelease ? 'var(--accent-emerald)' : 'var(--text-muted)'
            }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="font-mono tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: nextRelease ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
            {nextRelease ? getCountdown(nextRelease.scheduled_publish_time || nextRelease.scheduledPublishTime) : 'None Queued'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {nextRelease ? formatIST(nextRelease.scheduled_publish_time || nextRelease.scheduledPublishTime) : 'Ready videos waiting below'}
          </div>
        </div>

        {/* Metric 3: Timezone & Reference */}
        <div className="anymyn-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Operating Timezone
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--bg-panel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Globe size={16} />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Asia/Kolkata (IST)
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            UTC+05:30 · Converted to UTC ISO 8601 for YouTube
          </div>
        </div>

        {/* Metric 4: Published History Count */}
        <div className="anymyn-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Published Releases
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--bg-panel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)'
            }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="font-mono tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            {publishedProjects.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Live or private on YouTube channel
          </div>
        </div>
      </div>

      {/* SECTION 1: UPCOMING SCHEDULED RELEASES */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Upcoming Scheduled Releases
            </h2>
            <span className="badge badge-gold font-mono">{allScheduled.length}</span>
          </div>
        </div>

        {allScheduled.length === 0 ? (
          <div className="anymyn-card" style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-delicate)'
          }}>
            <Calendar size={40} color="var(--accent-gold)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              No Scheduled Video Releases
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.6 }}>
              You do not have any videos currently scheduled for automatic release on YouTube.
              Select one of your rendered videos below to schedule its release date and time.
            </p>
            {readyToSchedule.length > 0 && (
              <button
                onClick={() => onSelectProject(readyToSchedule[0].slug)}
                className="btn-gold"
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                <Film size={15} />
                <span>Schedule "{readyToSchedule[0].title}"</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {allScheduled.map((item, idx) => {
              const slug = item.project_slug || item.projectSlug || item.slug;
              const matchingProj = projects.find(p => p.slug === slug);
              const publishTime = item.scheduled_publish_time || item.scheduledPublishTime || matchingProj?.metadata?.scheduledPublishTime;
              const countdownStr = getCountdown(publishTime);
              const title = item.title || matchingProj?.metadata?.youtubeTitle || matchingProj?.title || slug;
              const videoId = item.youtube_video_id || item.youtubeVideoId || matchingProj?.metadata?.youtubeVideoId;

              return (
                <div
                  key={slug || idx}
                  className="anymyn-card"
                  style={{
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20,
                    flexWrap: 'wrap',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--accent-gold-border)',
                    boxShadow: 'var(--shadow-gold)'
                  }}
                >
                  {/* Left: Thumbnail & Project Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 280, flex: 1 }}>
                    {/* 9:16 Video preview frame */}
                    <div
                      onClick={() => onSelectProject(slug)}
                      style={{
                        width: 72,
                        height: 108,
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: '#1F1C19',
                        flexShrink: 0,
                        position: 'relative',
                        cursor: 'pointer',
                        border: '1px solid var(--border-delicate)'
                      }}
                    >
                      <img
                        src={`/api/media/thumbnail/${slug}`}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.25)'
                      }}>
                        <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className="badge badge-gold">
                          <Calendar size={11} /> SCHEDULED
                        </span>
                        <span className="badge badge-muted">
                          Education (27)
                        </span>
                        {videoId && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            ID: <code className="font-mono">{videoId}</code>
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => onSelectProject(slug)}
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          lineHeight: 1.4,
                          marginBottom: 4
                        }}
                      >
                        {title}
                      </h3>

                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Project Slug: <code className="font-mono">{slug}</code>
                      </div>
                    </div>
                  </div>

                  {/* Center: Time & Countdown Box */}
                  <div style={{
                    padding: '12px 18px',
                    borderRadius: 8,
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-delicate)',
                    minWidth: 260
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Clock size={14} color="var(--accent-gold)" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Release Countdown
                      </span>
                    </div>

                    <div className="font-mono tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {countdownStr}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                      {formatIST(publishTime)}
                    </div>

                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      UTC: {formatUTC(publishTime)}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => onSelectProject(slug)}
                      className="btn-outline"
                      style={{ padding: '8px 12px', fontSize: 12 }}
                      title="Open in Workspace"
                    >
                      <Film size={14} />
                      <span>Workspace</span>
                    </button>

                    <button
                      onClick={() => handleOpenReschedule(item)}
                      className="btn-outline"
                      style={{ padding: '8px 12px', fontSize: 12 }}
                      title="Reschedule release time"
                    >
                      <Clock size={14} />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => setCancelModalItem(item)}
                      className="btn-outline"
                      style={{ padding: '8px 12px', fontSize: 12, color: 'var(--accent-crimson)', borderColor: '#F5C6C6' }}
                      title="Cancel schedule and revert to private"
                    >
                      <Trash2 size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: READY TO SCHEDULE (Rendered Videos) */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Ready to Schedule
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Master renders completed and waiting for YouTube release scheduling.
            </p>
          </div>
          <span className="badge badge-emerald font-mono">{readyToSchedule.length} Ready</span>
        </div>

        {readyToSchedule.length === 0 ? (
          <div className="anymyn-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
            All rendered videos are currently scheduled or live. Render new videos via the video director skill to queue more releases.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 16
          }}>
            {readyToSchedule.map(p => {
              const meta = p.metadata || {};
              const title = meta.youtubeTitle || p.title;
              const hasAiMeta = !!meta.aiMetadataRaw || meta.metadataStatus === 'ai_generated';

              return (
                <div
                  key={p.slug}
                  className="anymyn-card"
                  style={{
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14
                  }}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    {/* Vertical thumbnail */}
                    <div style={{
                      width: 60,
                      height: 90,
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: '#1F1C19',
                      flexShrink: 0
                    }}>
                      <img
                        src={`/api/media/thumbnail/${p.slug}`}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span className="badge badge-emerald">Master Ready</span>
                        {meta.metadataStatus === 'approved' ? (
                          <span className="badge badge-emerald">Approved</span>
                        ) : meta.metadataStatus === 'user_edited' ? (
                          <span className="badge badge-muted">User Edited</span>
                        ) : (
                          <span className="badge badge-gold">AI Meta</span>
                        )}
                      </div>

                      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>
                        {title}
                      </h4>

                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {p.slug} · {p.videoStream?.duration ? `${p.videoStream.duration.toFixed(0)}s` : '52s'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-delicate)'
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {hasAiMeta ? 'Chapters & Tags synced' : 'AI Metadata ready'}
                    </span>

                    <button
                      onClick={() => onSelectProject(p.slug)}
                      className="btn-gold"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      <Calendar size={13} />
                      <span>Schedule Release</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: PUBLISHED ARCHIVE */}
      {publishedProjects.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Previously Published
            </h2>
            <span className="badge badge-muted font-mono">{publishedProjects.length}</span>
          </div>

          <div className="anymyn-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 100px',
              padding: '10px 16px',
              background: 'var(--bg-panel)',
              borderBottom: '1px solid var(--border-delicate)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <span>Video Title</span>
              <span>YouTube Video ID</span>
              <span>Published Date</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {publishedProjects.map(p => {
              const meta = p.metadata || {};
              const videoId = meta.youtubeVideoId;
              const title = meta.youtubeTitle || p.title;
              const ytUrl = `https://www.youtube.com/shorts/${videoId}`;

              return (
                <div
                  key={p.slug}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 100px',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-delicate-subtle)',
                    alignItems: 'center',
                    fontSize: 13
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {title}
                  </div>
                  <div>
                    <code className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {videoId}
                    </code>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {meta.uploadedAt ? new Date(meta.uploadedAt).toLocaleDateString() : '—'}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <a
                      href={ytUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      <ExternalLink size={12} />
                      <span>Watch</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalItem && (
        <div className="modal-overlay" onClick={() => setRescheduleModalItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-delicate)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Reschedule YouTube Release
                </h3>
              </div>
              <button
                onClick={() => setRescheduleModalItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 16 }}>
                Updating scheduled release for <strong>"{rescheduleModalItem.title || rescheduleModalItem.project_slug}"</strong> on YouTube.
              </p>

              {modalError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'var(--accent-crimson-light)',
                  border: '1px solid #F5C6C6',
                  color: 'var(--accent-crimson)',
                  fontSize: 12,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={15} />
                  <span>{modalError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Release Date (IST)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="anymyn-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Release Time (IST)
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="anymyn-input"
                  />
                </div>
              </div>

              {/* Time Preview Box */}
              {newDate && newTime && (
                <div style={{
                  padding: 12,
                  borderRadius: 6,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-delicate)',
                  fontSize: 12
                }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Target Release Window:</div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {formatIST(new Date(`${newDate}T${newTime}:00`).toISOString())}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Countdown: {getCountdown(new Date(`${newDate}T${newTime}:00`).toISOString())}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-delicate)',
              background: 'var(--bg-panel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10
            }}>
              <button
                onClick={() => setRescheduleModalItem(null)}
                className="btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReschedule}
                disabled={isSubmitting || !newDate || !newTime}
                className="btn-gold"
              >
                <Clock size={14} />
                <span>{isSubmitting ? 'Updating...' : 'Confirm Reschedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL SCHEDULE CONFIRMATION MODAL */}
      {cancelModalItem && (
        <div className="modal-overlay" onClick={() => setCancelModalItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-delicate)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--accent-crimson-light)'
            }}>
              <ShieldAlert size={20} color="var(--accent-crimson)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-crimson)' }}>
                Cancel Scheduled Release?
              </h3>
            </div>

            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>
                Are you sure you want to cancel the scheduled release for <strong>"{cancelModalItem.title || cancelModalItem.project_slug}"</strong>?
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The video on YouTube will immediately be reverted to <strong>PRIVATE</strong> visibility and will not automatically release. You can reschedule or publish it at any time from Workspace.
              </p>
            </div>

            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-delicate)',
              background: 'var(--bg-panel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10
            }}>
              <button
                onClick={() => setCancelModalItem(null)}
                className="btn-outline"
                disabled={isCancelling}
              >
                Keep Scheduled
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="btn-primary"
                style={{ background: 'var(--accent-crimson)', borderColor: '#9E2D2D' }}
              >
                <span>{isCancelling ? 'Cancelling...' : 'Cancel Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
