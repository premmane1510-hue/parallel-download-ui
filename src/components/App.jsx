import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Search, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import useDownloadAPI from '../hooks/useDownloadAPI';
import DownloadItemCard from './DownloadItemCard';
import './MultiDownloadManager.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);

  const {
    downloads,
    files,
    stats,
    loading,
    error,
    isConnected,
    createDownload,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    deleteDownload,
    setError
  } = useDownloadAPI();

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Handle add download
  const handleAddDownload = async () => {
    if (!isConnected) {
      showNotification('Not connected to server', 'error');
      return;
    }

    const availableFiles = files.filter(
      file => !downloads.some(d => d.fileId === file.id)
    );

    if (availableFiles.length === 0) {
      showNotification('All files are already added', 'error');
      return;
    }

    try {
      const file = availableFiles[0];
      await createDownload(file.id);
      showNotification(`Added ${file.name} to downloads`);
    } catch (err) {
      showNotification(`Error: ${error}`, 'error');
    }
  };

  // Handle start download
  const handleStartDownload = async (id) => {
    try {
      await startDownload(id);
      showNotification('Download started');
    } catch (err) {
      showNotification(`Error: ${error}`, 'error');
    }
  };

  // Handle pause download
  const handlePauseDownload = async (id) => {
    try {
      await pauseDownload(id);
      showNotification('Download paused');
    } catch (err) {
      showNotification(`Error: ${error}`, 'error');
    }
  };

  // Handle resume download
  const handleResumeDownload = async (id) => {
    try {
      await resumeDownload(id);
      showNotification('Download resumed');
    } catch (err) {
      showNotification(`Error: ${error}`, 'error');
    }
  };

  // Handle cancel download
  const handleCancelDownload = async (id) => {
    try {
      await cancelDownload(id);
      showNotification('Download cancelled');
    } catch (err) {
      showNotification(`Error: ${error}`, 'error');
    }
  };

  // Handle delete download
  const handleDeleteDownload = async (id) => {
    try {
      await deleteDownload(id);
      showNotification('Download deleted');
    } catch (err) {
      showNotification(`Error: ${error}`, 'error');
    }
  };

  // Filter downloads
  const filteredDownloads = downloads.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className={`download-manager ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Connection Status */}
      {!isConnected && (
        <motion.div
          className="connection-alert"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
        >
          <WifiOff size={20} />
          <span>Connection lost. Reconnecting...</span>
        </motion.div>
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`toast toast-${notification.type}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {notification.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="manager-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-title">
          <h1>📥 Download Manager</h1>
          <motion.div
            className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <span className="status-dot" />
            {isConnected ? 'Connected' : 'Offline'}
          </motion.div>
        </div>
        <div className="header-actions">
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="btn btn-theme"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          <motion.button
            onClick={handleAddDownload}
            disabled={!isConnected || loading || downloads.length >= files.length}
            className="btn btn-add"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Add new download"
          >
            {loading ? '⏳ Loading...' : '+ Add Download'}
          </motion.button>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        className="stats-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="stat">
          <span className="stat-label">Total Downloads</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Active</span>
          <span className="stat-value">{stats.downloading}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Avg Speed</span>
          <span className="stat-value">{stats.averageSpeed} MB/s</span>
        </div>
      </motion.div>

      {/* Search & Filter */}
      {downloads.length > 0 && (
        <motion.div
          className="search-filter-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search downloads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            {['all', 'pending', 'downloading', 'paused', 'completed'].map(
              (status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Downloads List */}
      <div className="downloads-list">
        <AnimatePresence mode="popLayout">
          {filteredDownloads.map((download) => (
            <DownloadItemCard
              key={download.id}
              download={download}
              onStart={() => handleStartDownload(download.id)}
              onPause={() => handlePauseDownload(download.id)}
              onResume={() => handleResumeDownload(download.id)}
              onCancel={() => handleCancelDownload(download.id)}
              onDelete={() => handleDeleteDownload(download.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {downloads.length === 0 && !loading && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>📂 No downloads yet. Click "Add Download" to get started!</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          className="loading-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="spinner" />
          <p>Loading downloads...</p>
        </motion.div>
      )}
    </div>
  );
}

export default App;
