import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import DashboardView from './components/DashboardView.jsx';
import LibraryView from './components/LibraryView.jsx';
import WorkspaceView from './components/WorkspaceView.jsx';
import ScheduleView from './components/ScheduleView.jsx';
import PlaylistsView from './components/PlaylistsView.jsx';
import AnalyticsView from './components/AnalyticsView.jsx';
import CommentsView from './components/CommentsView.jsx';
import YouTubeSettingsModal from './components/YouTubeSettingsModal.jsx';
import PublishConfirmationModal from './components/PublishConfirmationModal.jsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'library' | 'workspace' | 'schedule' | 'playlists' | 'analytics' | 'comments'
  const [projects, setProjects] = useState([]);
  const [channelVideos, setChannelVideos] = useState([]);
  const [overview, setOverview] = useState(null);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [youtubeAuth, setYoutubeAuth] = useState(null);
  const [syncState, setSyncState] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Theme state with persistent localStorage
  const [theme, setTheme] = useState(() => {
    return (
      (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('anymyn-theme')) ||
      'light'
    );
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('anymyn-theme', nextTheme);
  };

  // Upload and modal states
  const [uploadState, setUploadState] = useState({}); // slug -> { uploadId, percent, status, message }
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(curr => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const [overviewRes, projectsRes, ytRes, channelVideosRes, syncRes] = await Promise.all([
        fetch('/api/overview').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/projects').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/youtube/status').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/youtube/videos').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/youtube/sync-status').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (overviewRes.success) setOverview(overviewRes);
      if (channelVideosRes.success && channelVideosRes.videos) {
        setChannelVideos(channelVideosRes.videos);
      }
      if (syncRes.success && syncRes.syncState) {
        setSyncState(syncRes.syncState);
      }
      if (projectsRes.success && projectsRes.projects) {
        setProjects(projectsRes.projects);
        // Default to first project with rendered master if none selected
        if (!selectedProjectSlug && projectsRes.projects.length > 0) {
          const preferred = projectsRes.projects.find(p => p.hasRenderedVideo) || projectsRes.projects[0];
          setSelectedProjectSlug(preferred.slug);
        }
      }
      if (ytRes.success) setYoutubeAuth(ytRes);
    } catch (err) {
      console.error('Failed to load studio data:', err);
      showToast('Error connecting to ANYMYN Studio backend', 'error');
    }
  }, [selectedProjectSlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic lightweight status polling every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      fetch('/api/youtube/sync-status')
        .then(r => r.json())
        .then(data => {
          if (data.success && data.syncState) {
            setSyncState(data.syncState);
          }
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Refresh trigger for local projects
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
      showToast('Studio project index refreshed', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Channel sync trigger for real YouTube Data API
  const handleSyncChannel = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/youtube/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`YouTube channel synchronized: ${data.syncedVideosCount || 0} videos updated`, 'success');
        await loadData();
      } else {
        showToast(data.error || 'Failed to synchronize channel', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch to project workspace
  const handleSelectProject = (slug) => {
    setSelectedProjectSlug(slug);
    const matchingProj = projects.find(p => p.slug === slug);
    const ytVideoId = matchingProj?.metadata?.youtubeVideoId || matchingProj?.latestUpload?.youtube_video_id;
    if (ytVideoId) {
      setSelectedVideoId(ytVideoId);
    } else {
      setSelectedVideoId(null);
    }
    setCurrentTab('workspace');
  };

  // Switch to video in workspace (can be channel-only or local project)
  const handleSelectVideo = (videoId) => {
    setSelectedVideoId(videoId);
    const matchingVideo = channelVideos.find(v => v.video_id === videoId);
    if (matchingVideo?.project_slug) {
      setSelectedProjectSlug(matchingVideo.project_slug);
    } else {
      setSelectedProjectSlug(null);
    }
    setCurrentTab('workspace');
  };

  // Save metadata draft
  const handleSaveMetadata = async (slug, metadata) => {
    try {
      const res = await fetch(`/api/projects/${slug}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Metadata draft saved successfully', 'success');
        await loadData();
      } else {
        showToast(data.error || 'Failed to save metadata', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Generate or Regenerate AI Metadata
  const handleGenerateMetadata = async (slug, force = false) => {
    try {
      const res = await fetch(`/api/projects/${slug}/metadata/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'AI YouTube Metadata generated successfully', 'success');
        await loadData();
        return data;
      } else {
        showToast(data.error || 'Failed to generate metadata', 'error');
        return null;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    }
  };

  // Approve metadata for publishing
  const handleApproveMetadata = async (slug) => {
    try {
      const res = await fetch(`/api/projects/${slug}/metadata/approve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Metadata approved for release', 'success');
        await loadData();
        return data;
      } else {
        showToast(data.error || 'Failed to approve metadata', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Restore original AI metadata draft
  const handleRestoreMetadata = async (slug) => {
    try {
      const res = await fetch(`/api/projects/${slug}/metadata/restore`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Original AI metadata draft restored', 'success');
        await loadData();
        return data;
      } else {
        showToast(data.error || 'Failed to restore metadata', 'error');
        return null;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    }
  };

  // Schedule or Reschedule video for release
  const handleScheduleVideo = async (slug, scheduledPublishTime, timezone = 'Asia/Kolkata') => {
    try {
      const res = await fetch(`/api/youtube/schedule/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledPublishTime,
          timezone,
          isMock: !!youtubeAuth?.testMode
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Video scheduled for release in ${timezone}`, 'success');
        await loadData();
        return data;
      } else {
        showToast(data.error || 'Failed to schedule video', 'error');
        throw new Error(data.error || 'Failed to schedule video');
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Cancel scheduled release (revert to private)
  const handleCancelSchedule = async (slug) => {
    try {
      const res = await fetch(`/api/youtube/cancel-schedule/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMock: !!youtubeAuth?.testMode })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Scheduled release cancelled (reverted to private)', 'info');
        await loadData();
        return data;
      } else {
        showToast(data.error || 'Failed to cancel schedule', 'error');
        throw new Error(data.error || 'Failed to cancel schedule');
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Initiate YouTube upload
  const handleUploadToYouTube = (project, formData, customThumbnail) => {
    if (formData.privacy === 'public') {
      setPendingUpload({ project, formData, customThumbnail });
      setIsConfirmOpen(true);
    } else {
      executeUpload(project, formData, customThumbnail);
    }
  };

  // Execute upload process with progress polling
  const executeUpload = async (project, formData, customThumbnail) => {
    const slug = project.slug;

    // Optional: upload custom thumbnail first if user selected one
    if (customThumbnail) {
      const thumbData = new FormData();
      thumbData.append('thumbnail', customThumbnail);
      try {
        await fetch(`/api/projects/${slug}/thumbnail`, {
          method: 'POST',
          body: thumbData
        });
      } catch (err) {
        console.warn('Custom thumbnail upload skipped:', err);
      }
    }

    // Launch upload session
    try {
      setUploadState(prev => ({
        ...prev,
        [slug]: { status: 'uploading', percent: 1, message: 'Initiating upload stream...' }
      }));

      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      let scheduledPublishTime = null;
      if (formData.scheduledDate && formData.scheduledTime) {
        scheduledPublishTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
      }

      const res = await fetch('/api/youtube/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectSlug: slug,
          title: formData.title,
          description: formData.description,
          tags: tagsArray,
          categoryId: formData.category,
          privacyStatus: formData.privacy,
          scheduledPublishTime,
          isSyntheticMedia: formData.isSynthetic,
          isMock: !!youtubeAuth?.testMode
        })
      });

      const data = await res.json();
      if (!data.success) {
        setUploadState(prev => ({
          ...prev,
          [slug]: { status: 'error', percent: 0, message: data.error }
        }));
        showToast(data.error, 'error');
        return;
      }

      const uploadId = data.uploadId;

      // Poll progress every 800ms
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/youtube/upload-progress/${uploadId}`);
          const pollData = await pollRes.json();

          if (pollData.success && pollData.progress) {
            const prog = pollData.progress;
            setUploadState(prev => ({
              ...prev,
              [slug]: prog
            }));

            if (['success', 'completed'].includes(prog.status)) {
              clearInterval(pollInterval);
              showToast(`Uploaded to YouTube: "${formData.title}"`, 'success');
              await loadData();
            } else if (['error', 'failed'].includes(prog.status)) {
              clearInterval(pollInterval);
              showToast(prog.error || 'Upload error occurred', 'error');
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 800);

    } catch (err) {
      setUploadState(prev => ({
        ...prev,
        [slug]: { status: 'error', percent: 0, message: err.message }
      }));
      showToast(err.message, 'error');
    }
  };

  const activeProject = projects.find(p => p.slug === selectedProjectSlug) || (selectedProjectSlug ? null : projects[0]);
  const activeVideo = channelVideos.find(v => v.video_id === selectedVideoId) ||
    (activeProject?.metadata?.youtubeVideoId ? channelVideos.find(v => v.video_id === activeProject.metadata.youtubeVideoId) : null);

  const scheduledCount = (overview?.youtubeStats?.scheduledVideos) || projects.filter(p => {
    const m = p.metadata || {};
    return (
      m.privacyStatus === 'scheduled' ||
      m.youtubeStatus === 'scheduled' ||
      (m.scheduledPublishTime && new Date(m.scheduledPublishTime) > new Date())
    );
  }).length;

  return (
    <div className="anymyn-grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        youtubeAuth={youtubeAuth}
        onOpenYouTubeSettings={() => setIsSettingsOpen(true)}
        onSyncChannel={handleSyncChannel}
        isSyncing={isSyncing}
        lastSyncedAt={syncState?.last_synced_at || overview?.syncState?.last_synced_at}
        scheduledCount={scheduledCount}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentTab === 'dashboard' && (
          <DashboardView
            overview={overview}
            projects={projects}
            channelVideos={channelVideos}
            youtubeAuth={youtubeAuth}
            onSelectProject={handleSelectProject}
            onSelectVideo={handleSelectVideo}
            onNavigateTab={setCurrentTab}
            onOpenYouTubeSettings={() => setIsSettingsOpen(true)}
            onSyncChannel={handleSyncChannel}
            isSyncing={isSyncing}
          />
        )}

        {currentTab === 'library' && (
          <LibraryView
            projects={projects}
            channelVideos={channelVideos}
            onSelectProject={handleSelectProject}
            onSelectVideo={handleSelectVideo}
            onOpenYouTubeSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentTab === 'schedule' && (
          <ScheduleView
            projects={projects}
            overview={overview}
            onSelectProject={handleSelectProject}
            onNavigateTab={setCurrentTab}
            youtubeAuth={youtubeAuth}
            onOpenYouTubeSettings={() => setIsSettingsOpen(true)}
            onRefresh={loadData}
            onReschedule={handleScheduleVideo}
            onCancelSchedule={handleCancelSchedule}
          />
        )}

        {currentTab === 'playlists' && (
          <PlaylistsView
            channelVideos={channelVideos}
            youtubeAuth={youtubeAuth}
            onOpenYouTubeSettings={() => setIsSettingsOpen(true)}
            showToast={showToast}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            youtubeAuth={youtubeAuth}
            onOpenYouTubeSettings={() => setIsSettingsOpen(true)}
            showToast={showToast}
          />
        )}

        {currentTab === 'comments' && (
          <CommentsView
            youtubeAuth={youtubeAuth}
            onOpenYouTubeSettings={() => setIsSettingsOpen(true)}
            showToast={showToast}
          />
        )}

        {currentTab === 'workspace' && (
          <WorkspaceView
            project={activeProject}
            selectedVideo={activeVideo}
            youtubeAuth={youtubeAuth}
            onSaveMetadata={handleSaveMetadata}
            onUploadToYouTube={handleUploadToYouTube}
            uploadState={uploadState}
            onOpenYouTubeSettings={() => setIsSettingsOpen(true)}
            onRefreshProject={loadData}
            onGenerateMetadata={handleGenerateMetadata}
            onApproveMetadata={handleApproveMetadata}
            onRestoreMetadata={handleRestoreMetadata}
            onScheduleVideo={handleScheduleVideo}
            onCancelSchedule={handleCancelSchedule}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-delicate)',
        padding: '16px 24px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(4px)',
        fontSize: 12,
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/anymyn-logo.jpg"
            alt="ANYMYN"
            style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
          />
          <span className="font-cinzel" style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>ANYMYN</span>
          <span>&copy; {new Date().getFullYear()} Studio · High-Retention Financial Explainer Engineering</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>Bound exclusively to <code className="font-mono">127.0.0.1:4242</code></span>
          <span>·</span>
          <span>SQLite Native</span>
        </div>
      </footer>

      {/* YouTube Settings & OAuth Modal */}
      <YouTubeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        youtubeAuth={youtubeAuth}
        onRefreshAuth={async () => {
          const res = await fetch('/api/youtube/status').then(r => r.json());
          if (res.success) setYoutubeAuth(res);
          return res;
        }}
        onSyncChannel={handleSyncChannel}
        isSyncing={isSyncing}
      />

      {/* Guarded Public Publish Confirmation Modal */}
      {pendingUpload && (
        <PublishConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false);
            setPendingUpload(null);
          }}
          onConfirm={() => {
            if (pendingUpload) {
              executeUpload(pendingUpload.project, pendingUpload.formData, pendingUpload.customThumbnail);
              setPendingUpload(null);
            }
          }}
          project={pendingUpload.project}
          formData={pendingUpload.formData}
        />
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 18px',
          borderRadius: 8,
          background: toast.type === 'error' ? 'var(--accent-crimson)' : toast.type === 'success' ? '#24201C' : '#24201C',
          color: '#FAF8F5',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontSize: 13,
          fontWeight: 500
        }}>
          {toast.type === 'success' && <CheckCircle2 size={16} color="var(--accent-gold)" />}
          {toast.type === 'error' && <AlertCircle size={16} color="#FFD1D1" />}
          {toast.type === 'info' && <Info size={16} color="var(--accent-gold)" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#FAF8F5', cursor: 'pointer', marginLeft: 8 }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
