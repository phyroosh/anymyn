import React, { useState, useEffect, useRef } from 'react';
import YouTubeLiveManager from './YouTubeLiveManager.jsx';
import { 
  Film, 
  Youtube, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HardDrive, 
  Volume2, 
  Upload, 
  Save, 
  Copy, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw,
  Check,
  Tag,
  Calendar,
  Shield,
  Layers,
  Calculator,
  ChevronDown,
  Info,
  Globe,
  Edit3,
  Trash2
} from 'lucide-react';

export default function WorkspaceView({ 
  project, 
  selectedVideo,
  youtubeAuth, 
  onSaveMetadata, 
  onUploadToYouTube, 
  uploadState, 
  onOpenYouTubeSettings,
  onRefreshProject,
  onGenerateMetadata,
  onApproveMetadata,
  onRestoreMetadata,
  onScheduleVideo,
  onCancelSchedule,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('youtube'); // youtube | script | retention | storyboard | qc | math
  const [copiedPath, setCopiedPath] = useState(false);

  // Video Player state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(project?.videoStream?.duration || 0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Audio Stem player state
  const [audioStem, setAudioStem] = useState('voiceover'); // 'voiceover' | 'bgm'
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Form state for YouTube Publisher
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '27', // Education
    language: 'en',
    privacy: 'private', // Strict safe default
    scheduledDate: '',
    scheduledTime: '',
    isKids: false,
    isSynthetic: true
  });

  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Metadata & Scheduling states
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  // Reschedule & Cancel modals for already scheduled video
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Initialize form with project metadata
  useEffect(() => {
    if (project) {
      const meta = project.metadata || {};
      const initialTags = Array.isArray(meta.youtubeTags) 
        ? meta.youtubeTags.join(', ')
        : (meta.youtubeTags || 'personal finance, investing, money, financial literacy, anymyn');

      let defaultDesc = meta.youtubeDescription || '';
      if (!defaultDesc && project.script) {
        defaultDesc = `${project.title}\n\nKey takeaways and financial breakdown.\n\n#PersonalFinance #Money #ANYMYN`;
      }

      let schedDate = '';
      let schedTime = '';
      if (meta.scheduledPublishTime) {
        const d = new Date(meta.scheduledPublishTime);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        schedDate = `${year}-${month}-${day}`;
        schedTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        schedDate = `${year}-${month}-${day}`;
        schedTime = '18:00';
      }

      const initialPrivacy = (meta.privacyStatus === 'scheduled' || meta.youtubeStatus === 'scheduled' || meta.scheduledPublishTime)
        ? 'scheduled'
        : (meta.privacyStatus || 'private');

      setFormData({
        title: meta.youtubeTitle || project.title || '',
        description: defaultDesc,
        tags: initialTags,
        category: meta.youtubeCategory || '27',
        language: meta.youtubeLanguage || 'en',
        privacy: initialPrivacy,
        scheduledDate: schedDate,
        scheduledTime: schedTime,
        isKids: false,
        isSynthetic: true
      });

      if (project.contactSheetPath) {
        setThumbnailPreview(`/api/media/contact-sheet/${project.slug}`);
      }
    }
  }, [project?.slug, project?.metadata?.updatedAt, project?.metadata?.metadataStatus]);

  const activeYouTubeVideoId = selectedVideo?.video_id || project?.metadata?.youtubeVideoId || project?.latestUpload?.youtube_video_id;

  if (!project && selectedVideo) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: 24,
          alignItems: 'start'
        }}>
          {/* Left Column: Embedded YouTube Video Preview */}
          <div className="anymyn-card" style={{ padding: 20 }}>
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#000',
              marginBottom: 16
            }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.video_id}`}
                title={selectedVideo.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h2 className="font-cinzel" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {selectedVideo.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Channel Direct Entry</span>
              <span>·</span>
              <span className="font-mono">ID: {selectedVideo.video_id}</span>
              <span>·</span>
              <span>Published: {selectedVideo.published_at ? new Date(selectedVideo.published_at).toLocaleDateString() : 'Draft'}</span>
            </div>
          </div>

          {/* Right Column: Full YouTube Live Controls */}
          <div>
            <YouTubeLiveManager
              videoId={selectedVideo.video_id}
              videoData={selectedVideo}
              project={null}
              youtubeAuth={youtubeAuth}
              onRefresh={onRefreshProject}
              onOpenYouTubeSettings={onOpenYouTubeSettings}
              showToast={showToast}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center', padding: 32 }}>
        <Film size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
          No Project or Video Selected
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Select a project or channel video from the Video Library or Overview dashboard to inspect its media and publishing controls.
        </p>
      </div>
    );
  }

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyPath = () => {
    if (project.videoPath) {
      navigator.clipboard.writeText(project.videoPath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    let scheduledPublishTime = null;
    if (formData.scheduledDate && formData.scheduledTime) {
      scheduledPublishTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
    }

    try {
      await onSaveMetadata(project.slug, {
        youtubeTitle: formData.title,
        youtubeDescription: formData.description,
        youtubeTags: tagsArray,
        youtubeCategory: formData.category,
        youtubeLanguage: formData.language,
        privacyStatus: formData.privacy,
        scheduledPublishTime,
        isSyntheticMedia: formData.isSynthetic
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomThumbnail(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  // Video player controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const target = parseFloat(e.target.value);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration && videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  // Audio player controls
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsAudioPlaying(true);
    } else {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const meta = project.metadata || {};
  const isUploaded = !!meta.youtubeVideoId && (meta.youtubeStatus === 'published' || meta.privacyStatus === 'public');
  const isScheduled = meta.privacyStatus === 'scheduled' || meta.youtubeStatus === 'scheduled' || (meta.scheduledPublishTime && new Date(meta.scheduledPublishTime) > new Date());
  const youtubeUrl = meta.youtubeVideoId ? `https://youtu.be/${meta.youtubeVideoId}` : null;
  const currentUpload = uploadState?.[project.slug];

  const altTitles = meta.alternativeTitles || project.aiMetadata?.alternative_titles || [];
  const chapters = meta.chapters || project.aiMetadata?.chapters || [];

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

  const formatUTC = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toUTCString().replace('GMT', 'UTC');
    } catch {
      return isoString;
    }
  };

  const getCountdown = (targetIso) => {
    if (!targetIso) return '';
    const diff = new Date(targetIso).getTime() - Date.now();
    if (diff <= 0) return 'Publishing window reached';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getScheduledPreview = () => {
    if (!formData.scheduledDate || !formData.scheduledTime) return null;
    try {
      const localStr = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      const dateObj = new Date(localStr);
      const now = new Date();
      const diffMs = dateObj.getTime() - now.getTime();
      const isPast = diffMs < 10 * 60 * 1000;

      const istFormatted = dateObj.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' IST';

      const utcFormatted = dateObj.toUTCString().replace('GMT', 'UTC');

      let countdown = '';
      if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) countdown = `In ${days}d ${hours}h ${mins}m`;
        else if (hours > 0) countdown = `In ${hours}h ${mins}m`;
        else countdown = `In ${mins} minutes`;
      }

      return {
        isValid: !isPast,
        isPast,
        istFormatted,
        utcFormatted,
        countdown,
        isoString: dateObj.toISOString()
      };
    } catch {
      return null;
    }
  };

  const scheduledPreview = getScheduledPreview();

  const handleRegenerateMetadataClick = async (force = false) => {
    if (!force && (meta.isEdited || meta.metadataStatus === 'approved')) {
      setShowRegenConfirm(true);
      return;
    }
    setIsRegenerating(true);
    try {
      if (onGenerateMetadata) {
        const result = await onGenerateMetadata(project.slug, force);
        if (result && result.metadata) {
          const m = result.metadata;
          setFormData(prev => ({
            ...prev,
            title: m.youtube_title || m.title || prev.title,
            description: m.youtube_description || m.description || prev.description,
            tags: m.tags || prev.tags
          }));
        }
      }
    } finally {
      setIsRegenerating(false);
      setShowRegenConfirm(false);
    }
  };

  const handleRestoreMetadataClick = async () => {
    setIsRestoring(true);
    try {
      if (onRestoreMetadata) {
        const result = await onRestoreMetadata(project.slug);
        if (result && result.aiMetadata) {
          const m = result.aiMetadata;
          setFormData(prev => ({
            ...prev,
            title: m.title || prev.title,
            description: m.description || prev.description,
            tags: Array.isArray(m.tags) ? m.tags.join(', ') : m.tags || prev.tags
          }));
        }
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleApproveMetadataClick = async () => {
    setIsApproving(true);
    try {
      if (onApproveMetadata) {
        await onApproveMetadata(project.slug);
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleScheduleExisting = async () => {
    const preview = getScheduledPreview();
    if (!preview || !preview.isValid) return;
    setIsRescheduling(true);
    try {
      if (onScheduleVideo) {
        await onScheduleVideo(project.slug, preview.isoString, 'Asia/Kolkata');
      }
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleOpenRescheduleModal = () => {
    setRescheduleError('');
    if (meta.scheduledPublishTime) {
      const d = new Date(meta.scheduledPublishTime);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setRescheduleDate(`${year}-${month}-${day}`);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setRescheduleTime(`${hours}:${mins}`);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      setRescheduleDate(`${year}-${month}-${day}`);
      setRescheduleTime('18:00');
    }
    setRescheduleModalOpen(true);
  };

  const handleConfirmRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please choose both a date and time.');
      return;
    }
    const localStr = `${rescheduleDate}T${rescheduleTime}:00`;
    const targetDate = new Date(localStr);
    const now = new Date();
    if (targetDate.getTime() - now.getTime() < 10 * 60 * 1000) {
      setRescheduleError('Scheduled release time must be at least 15 minutes in the future.');
      return;
    }
    setIsRescheduling(true);
    setRescheduleError('');
    try {
      if (onScheduleVideo) {
        await onScheduleVideo(project.slug, targetDate.toISOString(), 'Asia/Kolkata');
      }
      setRescheduleModalOpen(false);
    } catch (err) {
      setRescheduleError(err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleConfirmCancelSchedule = async () => {
    setIsCancelling(true);
    try {
      if (onCancelSchedule) {
        await onCancelSchedule(project.slug);
      }
      setCancelModalOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '24px' }}>
      {/* Top Workspace Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-delicate)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--bg-wall)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--border-delicate)'
            }}>
              {project.slug}
            </span>
            {isUploaded ? (
              <span className="badge badge-emerald">
                <Youtube size={11} /> Published to YouTube
              </span>
            ) : isScheduled ? (
              <span className="badge badge-gold">
                <Calendar size={11} /> Scheduled for Release
              </span>
            ) : project.hasRenderedVideo ? (
              <span className="badge badge-emerald">
                Master Video Verified
              </span>
            ) : (
              <span className="badge badge-muted">
                In Production
              </span>
            )}
          </div>
          <h1 className="font-cinzel" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            {formData.title || project.title}
          </h1>
        </div>

        {/* Header Action Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isUploaded && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-gold"
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              <Youtube size={14} />
              <span>Watch on YouTube</span>
              <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="btn-outline"
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved Draft' : 'Save Draft'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split Layout: 9:16 Video Player (Left) + Production Drawer (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 420px) minmax(0, 1fr)',
        gap: 24,
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: 9:16 VERTICAL VIDEO PLAYER & TELEMETRY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Vertical Video Stage */}
          <div className="anymyn-card" style={{ padding: 14, background: '#FAF8F5' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '9 / 16',
              background: '#1A1816',
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {project.hasRenderedVideo ? (
                <video
                  ref={videoRef}
                  src={`/api/media/stream/${project.slug}`}
                  poster={thumbnailPreview}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  playsInline
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 24, color: '#FAF8F5' }}>
                  <Film size={40} color="#C58A35" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Master Render Pending</p>
                  <p style={{ fontSize: 11, color: '#A0998F', marginTop: 4 }}>
                    Source scripts and assets are available in the right drawer.
                  </p>
                </div>
              )}

              {/* Play / Pause Center Overlay Button */}
              {project.hasRenderedVideo && (
                <button
                  onClick={togglePlay}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(20, 18, 16, 0.65)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FAF8F5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isPlaying ? 0 : 0.9,
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = isPlaying ? 0 : 0.9}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 3 }} />}
                </button>
              )}

              {/* Resolution pill */}
              <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: 'rgba(20, 18, 16, 0.8)',
                backdropFilter: 'blur(4px)',
                color: '#FAF8F5',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                1080 × 1920
              </div>
            </div>

            {/* Custom Range 206 Scrubber & Controls */}
            {project.hasRenderedVideo && (
              <div style={{ marginTop: 12 }}>
                {/* Seek Bar */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent-gold)',
                    cursor: 'pointer'
                  }}
                />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={togglePlay}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                    </button>
                    <span>{formatSeconds(currentTime)} / {formatSeconds(duration)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                      value={playbackRate}
                      onChange={e => {
                        const r = parseFloat(e.target.value);
                        setPlaybackRate(r);
                        if (videoRef.current) videoRef.current.playbackRate = r;
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-delicate)',
                        borderRadius: 4,
                        padding: '1px 4px',
                        fontSize: 11,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="1">1.0x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2.0x</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Raw Audio Stems Player */}
          {project.hasVoiceover && (
            <div className="anymyn-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Volume2 size={15} color="var(--accent-emerald)" />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Audio Stems Studio</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => setAudioStem('voiceover')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      cursor: 'pointer',
                      border: 'none',
                      background: audioStem === 'voiceover' ? 'var(--accent-emerald-light)' : 'transparent',
                      color: audioStem === 'voiceover' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      fontWeight: 500
                    }}
                  >
                    Voiceover
                  </button>
                  <button
                    onClick={() => setAudioStem('bgm')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      cursor: 'pointer',
                      border: 'none',
                      background: audioStem === 'bgm' ? 'var(--accent-gold-light)' : 'transparent',
                      color: audioStem === 'bgm' ? 'var(--accent-gold)' : 'var(--text-muted)',
                      fontWeight: 500
                    }}
                  >
                    BGM
                  </button>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={`/api/media/audio/${project.slug}?stem=${audioStem}`}
                controls
                style={{ width: '100%', height: 32 }}
              />
            </div>
          )}

          {/* Stream Telemetry Monolith */}
          <div className="anymyn-card" style={{ padding: 16 }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              Stream Telemetry
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Format</span>
                <span className="font-mono">
                  {project.videoStream ? `${project.videoStream.width}×${project.videoStream.height} (9:16)` : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Framerate</span>
                <span className="font-mono">{project.videoStream ? `${project.videoStream.fps} FPS` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Video Codec</span>
                <span className="font-mono">{project.videoStream?.codec || 'H.264 / AVC'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Audio Stream</span>
                <span className="font-mono">{project.videoStream?.audioCodec || 'AAC / Stereo'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bitrate</span>
                <span className="font-mono">
                  {project.videoStream?.bitrate ? `${(project.videoStream.bitrate / 1000).toFixed(0)} kbps` : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>File Size</span>
                <span className="font-mono">
                  {project.videoStream?.size ? `${(project.videoStream.size / (1024 * 1024)).toFixed(2)} MB` : '—'}
                </span>
              </div>

              {/* Local File Path with Copy Button */}
              {project.videoPath && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-delicate-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Disk Location</span>
                    <button
                      onClick={handleCopyPath}
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
                      {copiedPath ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedPath ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    wordBreak: 'break-all',
                    background: 'var(--bg-wall)',
                    padding: '4px 6px',
                    borderRadius: 4
                  }}>
                    {project.videoPath}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCTION DRAWER & YOUTUBE PUBLISHING SUITE */}
        <div className="anymyn-card" style={{ padding: 24 }}>
          {/* Drawer Navigation Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            borderBottom: '1px solid var(--border-delicate)',
            paddingBottom: 12,
            marginBottom: 20,
            overflowX: 'auto'
          }}>
            {[
              { id: 'youtube', label: 'YouTube Publisher', icon: Youtube, color: '#C58A35' },
              { id: 'script', label: 'Script & Voiceover', icon: FileText, color: '#16845F' },
              { id: 'retention', label: 'Retention Map', icon: Sparkles, color: '#C58A35' },
              { id: 'storyboard', label: 'Storyboard', icon: Layers, color: 'var(--text-secondary)' },
              { id: 'qc', label: 'QC & Telemetry', icon: CheckCircle2, color: '#16845F' },
              { id: 'math', label: 'Verified Math', icon: Calculator, color: 'var(--text-secondary)' }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 500,
                    border: 'none',
                    background: isSelected ? 'var(--nav-active-bg)' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={15} color={isSelected ? tab.color : 'currentColor'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: YOUTUBE PUBLISHER */}
          {activeTab === 'youtube' && (
            activeYouTubeVideoId ? (
              <YouTubeLiveManager
                videoId={activeYouTubeVideoId}
                videoData={selectedVideo}
                project={project}
                youtubeAuth={youtubeAuth}
                onRefresh={onRefreshProject}
                onOpenYouTubeSettings={onOpenYouTubeSettings}
                showToast={showToast}
              />
            ) : (
            <div>
              {/* HONEST PUBLICATION / CONNECTION STATUS BANNERS */}

              {/* 1. If Published on YouTube */}
              {isUploaded && (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={20} color="var(--accent-emerald)" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--accent-emerald)', fontSize: 14 }}>
                        Published on YouTube
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Video ID: <code className="font-mono">{meta.youtubeVideoId}</code> · Published at {new Date(meta.uploadedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ background: 'var(--accent-emerald)', border: 'none', padding: '6px 12px', fontSize: 12 }}
                  >
                    <ExternalLink size={14} />
                    <span>Open YouTube Short</span>
                  </a>
                </div>
              )}

              {/* 2. Honest Channel Not Connected Banner */}
              {!isUploaded && !isScheduled && !youtubeAuth?.authenticated && (
                <div style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--accent-gold-light)',
                  border: '1px solid var(--accent-gold-border)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertCircle size={20} color="var(--accent-gold)" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                        YouTube Channel Not Connected
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        This video is not uploaded. Link your channel via Google OAuth to upload and schedule videos directly from ANYMYN Studio.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onOpenYouTubeSettings}
                    className="btn-gold"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                  >
                    <Youtube size={14} />
                    <span>Connect YouTube Channel</span>
                  </button>
                </div>
              )}

              {/* 3. Honest Ready but Not Uploaded Banner */}
              {!isUploaded && !isScheduled && youtubeAuth?.authenticated && (
                <div style={{
                  padding: 14,
                  borderRadius: 8,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-delicate)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--accent-emerald-light)',
                      border: '1px solid var(--accent-emerald-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-emerald)'
                    }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                          Not uploaded to YouTube
                        </span>
                        <span className="badge badge-emerald">Ready for Release</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Connected to channel <strong>{youtubeAuth.channel?.title || 'YouTube Channel'}</strong>. Uploads default safely to Private.
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-muted font-mono" style={{ fontSize: 11 }}>
                    1080 × 1920 Verified Master
                  </span>
                </div>
              )}

              {/* 4. Upload Failure Notification */}
              {currentUpload?.status === 'failed' && (
                <div style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--accent-crimson-light)',
                  border: '1px solid rgba(224, 83, 83, 0.4)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertCircle size={20} color="var(--accent-crimson)" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--accent-crimson)', fontSize: 13 }}>
                        Upload Failed
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {currentUpload.error || currentUpload.message || 'An error occurred during YouTube upload.'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onUploadToYouTube(project, formData, customThumbnail)}
                    className="btn-outline"
                    style={{ color: 'var(--accent-crimson)', borderColor: 'rgba(224, 83, 83, 0.4)', fontSize: 12 }}
                  >
                    Retry Upload
                  </button>
                </div>
              )}

              {/* Upload Progress Monitor */}
              {currentUpload && (
                <div style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--accent-gold-border)',
                  marginBottom: 20,
                  boxShadow: 'var(--shadow-gold)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Upload size={16} color="var(--accent-gold)" className={['success', 'completed'].includes(currentUpload.status) ? '' : 'spin-anim'} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        {['success', 'completed'].includes(currentUpload.status) ? 'Upload Completed!' : currentUpload.status === 'failed' ? 'Upload Failed' : 'Uploading to YouTube...'}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {currentUpload.progress !== undefined ? currentUpload.progress : (currentUpload.percent || 0)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: 8,
                    background: 'var(--bg-wall)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    marginBottom: 8
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${currentUpload.progress !== undefined ? currentUpload.progress : (currentUpload.percent || 0)}%`,
                      background: ['success', 'completed'].includes(currentUpload.status) ? 'var(--accent-emerald)' : currentUpload.status === 'failed' ? 'var(--accent-crimson)' : 'var(--accent-gold)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>
                      {((currentUpload.bytesUploaded || currentUpload.transferredBytes || 0) / (1024 * 1024)).toFixed(1)} MB of {project.videoStream?.size ? `${(project.videoStream.size / (1024 * 1024)).toFixed(1)} MB` : '—'}
                    </span>
                    <span>{currentUpload.message || (['success', 'completed'].includes(currentUpload.status) ? 'Verified in upload ledger' : '')}</span>
                  </div>
                </div>
              )}

              {/* ALREADY SCHEDULED BANNER */}
              {isScheduled && (
                <div style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--accent-gold-border)',
                  marginBottom: 20,
                  boxShadow: 'var(--shadow-gold)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: 'var(--accent-gold-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-gold)'
                      }}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                            Scheduled for YouTube Release
                          </span>
                          <span className="badge badge-gold">
                            <Clock size={11} /> {getCountdown(meta.scheduledPublishTime)}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                          <strong>{formatIST(meta.scheduledPublishTime)}</strong> · UTC: {formatUTC(meta.scheduledPublishTime)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={handleOpenRescheduleModal}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        <Clock size={14} />
                        <span>Reschedule</span>
                      </button>
                      <button
                        onClick={() => setCancelModalOpen(true)}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: 12, color: 'var(--accent-crimson)', borderColor: '#F5C6C6' }}
                      >
                        <Trash2 size={14} />
                        <span>Cancel Schedule</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* METADATA STATUS & ACTION CONTROLS */}
              <div style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-delicate)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Metadata Status:
                  </span>
                  {meta.metadataStatus === 'approved' || meta.isApproved ? (
                    <span className="badge badge-emerald">
                      <CheckCircle2 size={12} /> Approved for Publishing
                    </span>
                  ) : meta.isEdited || meta.metadataStatus === 'user_edited' ? (
                    <span className="badge badge-muted" style={{ background: '#ECE6D8', color: '#6851A4', border: '1px solid #D8D2EB' }}>
                      <Edit3 size={12} /> User Edited
                    </span>
                  ) : (
                    <span className="badge badge-gold">
                      <Sparkles size={12} /> AI Generated Draft
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => handleRegenerateMetadataClick(false)}
                    disabled={isRegenerating}
                    className="btn-outline"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    title="Re-run AI metadata generator"
                  >
                    <Sparkles size={13} className={isRegenerating ? 'spin-anim' : ''} />
                    <span>{isRegenerating ? 'Regenerating...' : 'Regenerate AI'}</span>
                  </button>

                  {meta.isEdited && (
                    <button
                      onClick={handleRestoreMetadataClick}
                      disabled={isRestoring}
                      className="btn-outline"
                      style={{ fontSize: 12, padding: '4px 10px' }}
                      title="Restore original AI draft"
                    >
                      <RotateCcw size={13} className={isRestoring ? 'spin-anim' : ''} />
                      <span>{isRestoring ? 'Restoring...' : 'Restore Original'}</span>
                    </button>
                  )}

                  {!(meta.metadataStatus === 'approved' || meta.isApproved) && (
                    <button
                      onClick={handleApproveMetadataClick}
                      disabled={isApproving}
                      className="btn-outline"
                      style={{ fontSize: 12, padding: '4px 10px', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald-border)' }}
                      title="Approve this metadata for production release"
                    >
                      <Check size={13} />
                      <span>{isApproving ? 'Approving...' : 'Approve Metadata'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* OUTDATED WARNING BANNER */}
              {meta.isMetadataOutdated && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: '#FFF8E6',
                  border: '1px solid #F2DFAC',
                  color: '#8A5D00',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={15} color="#C58A35" />
                    <span>
                      <strong>Production files updated:</strong> The script or video render was modified after metadata generation.
                    </span>
                  </div>
                  <button
                    onClick={() => handleRegenerateMetadataClick(true)}
                    disabled={isRegenerating}
                    className="btn-gold"
                    style={{ fontSize: 11, padding: '3px 10px' }}
                  >
                    <RotateCw size={11} className={isRegenerating ? 'spin-anim' : ''} />
                    <span>Sync Chapters &amp; Takeaway</span>
                  </button>
                </div>
              )}

              {/* YouTube Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Title */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      Video Title <span style={{ color: 'var(--accent-gold)' }}>*</span>
                    </label>
                    <span style={{ fontSize: 11, color: formData.title.length > 90 ? 'var(--accent-crimson)' : 'var(--text-muted)' }}>
                      {formData.title.length} / 100 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={100}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter high-retention title..."
                    className="anymyn-input"
                    style={{ fontWeight: 500 }}
                  />

                  {/* Alternative Title Suggestion Pills */}
                  {altTitles.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                        💡 Alternative AI Suggestions (Click to swap title):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {altTitles.map((alt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, title: alt }))}
                            className="btn-outline"
                            style={{
                              fontSize: 11,
                              padding: '3px 10px',
                              borderRadius: 16,
                              textAlign: 'left',
                              background: formData.title === alt ? 'var(--accent-gold-light)' : 'var(--bg-surface)',
                              borderColor: formData.title === alt ? 'var(--accent-gold)' : 'var(--border-delicate)',
                              color: formData.title === alt ? 'var(--accent-gold)' : 'var(--text-primary)'
                            }}
                          >
                            <span>"{alt}"</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description & Derived Chapters */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      Description &amp; Chapters
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Derived from audio scene timing &amp; verified takeaways
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add video overview, sources, calculations, and financial education disclaimer..."
                    className="anymyn-textarea"
                  />

                  {/* Derived Chapters Preview Accordion */}
                  {chapters.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => setShowChapters(!showChapters)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 11,
                          color: 'var(--accent-gold)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span>{showChapters ? '▼ Hide' : '▶ Show'} Timeline-Derived Chapters ({chapters.length} scenes)</span>
                      </button>
                      {showChapters && (
                        <div style={{
                          marginTop: 6,
                          padding: '8px 12px',
                          borderRadius: 6,
                          background: 'var(--bg-panel)',
                          border: '1px solid var(--border-delicate)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6
                        }}>
                          {chapters.map((ch, idx) => (
                            <span key={idx} style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-delicate)',
                              fontFamily: 'var(--font-mono)'
                            }}>
                              <strong style={{ color: 'var(--accent-gold)' }}>{ch.time}</strong> {ch.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="finance, investing, money, compound interest"
                    className="anymyn-input"
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {formData.tags.split(',').map((t, idx) => {
                      const tag = t.trim();
                      if (!tag) return null;
                      return (
                        <span key={idx} style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: 'var(--bg-panel)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-delicate)'
                        }}>
                          #{tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* 2-Column: Category & Language */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      YouTube Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="anymyn-select"
                    >
                      <option value="27">Education (Default)</option>
                      <option value="28">Science &amp; Technology</option>
                      <option value="26">Howto &amp; Style</option>
                      <option value="1">Film &amp; Animation</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Spoken Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                      className="anymyn-select"
                    >
                      <option value="en">English (en)</option>
                      <option value="en-US">English (United States)</option>
                      <option value="en-GB">English (United Kingdom)</option>
                    </select>
                  </div>
                </div>

                {/* Privacy & Scheduling Safeguard Selector (4 Options) */}
                <div style={{
                  padding: 16,
                  borderRadius: 8,
                  background: formData.privacy === 'public' ? 'var(--accent-crimson-light)' : 'var(--bg-panel)',
                  border: `1px solid ${formData.privacy === 'public' ? '#F5C6C6' : 'var(--border-delicate)'}`
                }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Publishing Mode &amp; Privacy <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>(Default safeguard is Private)</span>
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                      { id: 'private', label: 'Private (Safe Default)', desc: 'Only you can see' },
                      { id: 'unlisted', label: 'Unlisted', desc: 'Anyone with link' },
                      { id: 'public', label: 'Public Release', desc: 'Visible to everyone' },
                      { id: 'scheduled', label: 'Schedule Release', desc: 'Auto-publish on YouTube' }
                    ].map(p => (
                      <div
                        key={p.id}
                        onClick={() => setFormData({ ...formData, privacy: p.id })}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 6,
                          background: formData.privacy === p.id ? 'var(--bg-surface)' : 'transparent',
                          border: `1px solid ${formData.privacy === p.id ? 'var(--accent-gold)' : 'var(--border-delicate)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>
                          {p.label}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {p.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.privacy === 'public' && (
                    <div style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--accent-crimson)'
                    }}>
                      <AlertCircle size={14} />
                      <span>Public publishing requires an explicit confirmation check before launch.</span>
                    </div>
                  )}

                  {/* Scheduled Release Panel */}
                  {formData.privacy === 'scheduled' && (
                    <div style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: 8,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--accent-gold-border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Calendar size={15} color="var(--accent-gold)" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          YouTube Release Window (Asia/Kolkata · IST)
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                            Release Date (IST)
                          </label>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.scheduledDate}
                            onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                            className="anymyn-input"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                            Release Time (IST)
                          </label>
                          <input
                            type="time"
                            value={formData.scheduledTime}
                            onChange={e => setFormData({ ...formData, scheduledTime: e.target.value })}
                            className="anymyn-input"
                          />
                        </div>
                      </div>

                      {/* Calculated Schedule Preview */}
                      {scheduledPreview && (
                        <div style={{
                          padding: '10px 12px',
                          borderRadius: 6,
                          background: scheduledPreview.isValid ? 'var(--bg-panel)' : 'var(--accent-crimson-light)',
                          border: `1px solid ${scheduledPreview.isValid ? 'var(--border-delicate)' : '#F5C6C6'}`,
                          fontSize: 12
                        }}>
                          {scheduledPreview.isValid ? (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                                  {scheduledPreview.istFormatted}
                                </span>
                                <span className="font-mono tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                                  {scheduledPreview.countdown}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                UTC Time: {scheduledPreview.utcFormatted} (Transmitted to YouTube Data API v3)
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: 'var(--accent-crimson)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <AlertCircle size={14} />
                              <span>Release time must be at least 15 minutes in the future.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Compliance Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={formData.isSynthetic}
                      onChange={e => setFormData({ ...formData, isSynthetic: e.target.checked })}
                      style={{ accentColor: 'var(--accent-gold)' }}
                    />
                    <span>
                      <strong>Altered or synthetic content:</strong> Audio or visual elements are generated or digitally manipulated (complies with YouTube policy).
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={formData.isKids}
                      onChange={e => setFormData({ ...formData, isKids: e.target.checked })}
                      style={{ accentColor: 'var(--accent-gold)' }}
                    />
                    <span>
                      <strong>Made for Kids:</strong> No, this content is made for adult/general financial literacy.
                    </span>
                  </label>
                </div>

                {/* Custom Thumbnail Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Custom Thumbnail
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {thumbnailPreview && (
                      <div style={{
                        width: 90,
                        height: 50,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: '#1A1816',
                        border: '1px solid var(--border-delicate)'
                      }}>
                        <img src={thumbnailPreview} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <label className="btn-outline" style={{ fontSize: 12, cursor: 'pointer' }}>
                      <Upload size={14} />
                      <span>{customThumbnail ? 'Replace Image' : 'Select Custom Thumbnail'}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleThumbnailChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Defaults to contact sheet preview
                    </span>
                  </div>
                </div>

                {/* Upload Action Center */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-delicate)'
                }}>
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="btn-outline"
                  >
                    <Save size={15} />
                    <span>{isSaving ? 'Saving...' : 'Save Metadata Draft'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!youtubeAuth?.authenticated) {
                        onOpenYouTubeSettings();
                        return;
                      }
                      if (formData.privacy === 'scheduled' && !isUploaded) {
                        onUploadToYouTube(project, formData, customThumbnail);
                      } else if (formData.privacy === 'scheduled' && isUploaded) {
                        handleScheduleExisting();
                      } else {
                        onUploadToYouTube(project, formData, customThumbnail);
                      }
                    }}
                    disabled={!project.hasRenderedVideo || currentUpload?.status === 'uploading' || (formData.privacy === 'scheduled' && scheduledPreview && !scheduledPreview.isValid)}
                    className="btn-gold"
                    style={{ padding: '10px 20px', fontSize: 14 }}
                  >
                    {!youtubeAuth?.authenticated ? (
                      <>
                        <Youtube size={17} />
                        <span>Connect YouTube Channel to Publish</span>
                      </>
                    ) : formData.privacy === 'scheduled' ? (
                      <>
                        <Calendar size={17} />
                        <span>
                          {isRescheduling
                            ? 'Scheduling...'
                            : isUploaded
                            ? 'Update YouTube Schedule'
                            : 'Upload & Schedule Release'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Youtube size={17} />
                        <span>
                          {currentUpload?.status === 'uploading'
                            ? 'Uploading in progress...'
                            : formData.privacy === 'public'
                            ? 'Review & Publish Public'
                            : `Publish as ${formData.privacy.toUpperCase()}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            )
          )}

          {/* TAB 2: SCRIPT & VOICEOVER */}
          {activeTab === 'script' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700 }}>
                  Production Narrative &amp; Voiceover
                </h3>
                {project.hasVoiceover && (
                  <span className="badge badge-emerald">
                    <Volume2 size={11} /> ElevenLabs Master Synced
                  </span>
                )}
              </div>

              {project.elevenLabsScript && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                    ElevenLabs Phonetic Voiceover Text
                  </div>
                  <pre style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-delicate)',
                    borderRadius: 6,
                    padding: 14,
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 220,
                    overflowY: 'auto',
                    lineHeight: 1.6
                  }}>
                    {project.elevenLabsScript}
                  </pre>
                </div>
              )}

              {project.script ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Full Production Narrative
                  </div>
                  <pre style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-delicate)',
                    borderRadius: 6,
                    padding: 14,
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 380,
                    overflowY: 'auto',
                    lineHeight: 1.6
                  }}>
                    {project.script}
                  </pre>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No standalone script file found for this project.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RETENTION MAP */}
          {activeTab === 'retention' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700 }}>
                  Retention Engineering Architecture
                </h3>
                <span className="badge badge-gold">V1 Engine</span>
              </div>

              {project.retentionMap ? (
                <pre style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-delicate)',
                  borderRadius: 6,
                  padding: 16,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 480,
                  overflowY: 'auto',
                  lineHeight: 1.6
                }}>
                  {project.retentionMap}
                </pre>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No retention map file found in project directory.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STORYBOARD */}
          {activeTab === 'storyboard' && (
            <div>
              <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                Visual Storyboard &amp; Scene Breakdown
              </h3>
              {project.storyboard ? (
                <pre style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-delicate)',
                  borderRadius: 6,
                  padding: 16,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 480,
                  overflowY: 'auto',
                  lineHeight: 1.6
                }}>
                  {project.storyboard}
                </pre>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No storyboard file found in project directory.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: QC & AUDIT */}
          {activeTab === 'qc' && (
            <div>
              <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                Automated Quality Control &amp; Invariants Report
              </h3>
              {project.qcReport ? (
                <pre style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-delicate)',
                  borderRadius: 6,
                  padding: 16,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 480,
                  overflowY: 'auto',
                  lineHeight: 1.6
                }}>
                  {project.qcReport}
                </pre>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No QC report file found in project directory.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CALCULATIONS & DATA */}
          {activeTab === 'math' && (
            <div>
              <h3 className="font-cinzel" style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                Verified Financial Calculations
              </h3>
              {project.calculations ? (
                <pre style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-delicate)',
                  borderRadius: 6,
                  padding: 16,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 480,
                  overflowY: 'auto',
                  lineHeight: 1.6
                }}>
                  {typeof project.calculations === 'object'
                    ? JSON.stringify(project.calculations, null, 2)
                    : project.calculations}
                </pre>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No verified calculations JSON found in project directory.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* REGENERATE METADATA CONFIRMATION MODAL */}
      {showRegenConfirm && (
        <div className="modal-overlay" onClick={() => setShowRegenConfirm(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-delicate)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--accent-gold-light)'
            }}>
              <Sparkles size={20} color="var(--accent-gold)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Regenerate AI YouTube Metadata?
              </h3>
            </div>

            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>
                This project has custom manual edits or has already been approved. Regenerating will create a fresh AI publishing package derived from the latest script and scene timing, replacing any manual text.
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Do you want to proceed and overwrite the current title and description?
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
                onClick={() => setShowRegenConfirm(false)}
                className="btn-outline"
                disabled={isRegenerating}
              >
                Keep Current Metadata
              </button>
              <button
                onClick={() => handleRegenerateMetadataClick(true)}
                disabled={isRegenerating}
                className="btn-gold"
              >
                <Sparkles size={14} className={isRegenerating ? 'spin-anim' : ''} />
                <span>{isRegenerating ? 'Regenerating...' : 'Confirm & Regenerate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalOpen && (
        <div className="modal-overlay" onClick={() => setRescheduleModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
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
                onClick={() => setRescheduleModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 16 }}>
                Updating scheduled release window for <strong>"{formData.title || project.title}"</strong> on YouTube.
              </p>

              {rescheduleError && (
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
                  <span>{rescheduleError}</span>
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
                    value={rescheduleDate}
                    onChange={e => setRescheduleDate(e.target.value)}
                    className="anymyn-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Release Time (IST)
                  </label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={e => setRescheduleTime(e.target.value)}
                    className="anymyn-input"
                  />
                </div>
              </div>

              {rescheduleDate && rescheduleTime && (
                <div style={{
                  padding: 12,
                  borderRadius: 6,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-delicate)',
                  fontSize: 12
                }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Target Release Window:</div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {formatIST(new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString())}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Countdown: {getCountdown(new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString())}
                  </div>
                </div>
              )}
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
                onClick={() => setRescheduleModalOpen(false)}
                className="btn-outline"
                disabled={isRescheduling}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRescheduleSubmit}
                disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                className="btn-gold"
              >
                <Clock size={14} />
                <span>{isRescheduling ? 'Updating...' : 'Confirm Reschedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL SCHEDULE CONFIRMATION MODAL */}
      {cancelModalOpen && (
        <div className="modal-overlay" onClick={() => setCancelModalOpen(false)}>
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
                Are you sure you want to cancel the scheduled release for <strong>"{formData.title || project.title}"</strong>?
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The video on YouTube will immediately be reverted to <strong>PRIVATE</strong> visibility and will not automatically release. You can reschedule or publish it at any time.
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
                onClick={() => setCancelModalOpen(false)}
                className="btn-outline"
                disabled={isCancelling}
              >
                Keep Scheduled
              </button>
              <button
                onClick={handleConfirmCancelSchedule}
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
