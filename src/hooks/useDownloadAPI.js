import { useState, useEffect, useCallback } from 'react';
import { downloadsAPI, filesAPI, healthCheck } from '../services/api';

function useDownloadAPI() {
  const [downloads, setDownloads] = useState([]);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    downloading: 0,
    completed: 0,
    totalSize: 0,
    totalDownloaded: 0,
    averageSpeed: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check server connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await healthCheck();
        setIsConnected(true);
        console.log('✅ Connected to backend');
      } catch (err) {
        setIsConnected(false);
        console.error('❌ Failed to connect to backend:', err.message);
        setError('Failed to connect to backend server');
      }
    };

    checkConnection();
  }, []);

  // Fetch available files
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getAvailableFiles();
      setFiles(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all downloads
  const fetchDownloads = useCallback(async () => {
    try {
      const response = await downloadsAPI.getAll();
      setDownloads(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching downloads:', err);
    }
  }, []);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await downloadsAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Create new download
  const createDownload = useCallback(async (fileId) => {
    try {
      setLoading(true);
      const response = await downloadsAPI.create(fileId);
      setDownloads([...downloads, response.data.data]);
      setError(null);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create download';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [downloads]);

  // Start download
  const startDownload = useCallback(async (downloadId) => {
    try {
      const response = await downloadsAPI.start(downloadId);
      updateDownloadInState(downloadId, response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start download');
      throw err;
    }
  }, []);

  // Pause download
  const pauseDownload = useCallback(async (downloadId) => {
    try {
      const response = await downloadsAPI.pause(downloadId);
      updateDownloadInState(downloadId, response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pause download');
      throw err;
    }
  }, []);

  // Resume download
  const resumeDownload = useCallback(async (downloadId) => {
    try {
      const response = await downloadsAPI.resume(downloadId);
      updateDownloadInState(downloadId, response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resume download');
      throw err;
    }
  }, []);

  // Cancel download
  const cancelDownload = useCallback(async (downloadId) => {
    try {
      await downloadsAPI.cancel(downloadId);
      setDownloads(downloads.filter(d => d.id !== downloadId));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel download');
      throw err;
    }
  }, [downloads]);

  // Delete download
  const deleteDownload = useCallback(async (downloadId) => {
    try {
      await downloadsAPI.delete(downloadId);
      setDownloads(downloads.filter(d => d.id !== downloadId));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete download');
      throw err;
    }
  }, [downloads]);

  // Helper function to update download in state
  const updateDownloadInState = (downloadId, updatedData) => {
    setDownloads(downloads.map(d => (d.id === downloadId ? updatedData : d)));
  };

  // Poll for updates
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchDownloads();
      fetchStats();
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, [isConnected, fetchDownloads, fetchStats]);

  // Initial fetch
  useEffect(() => {
    if (isConnected) {
      fetchFiles();
      fetchDownloads();
      fetchStats();
    }
  }, [isConnected, fetchFiles, fetchDownloads, fetchStats]);

  return {
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
    fetchDownloads,
    fetchStats,
    setError
  };
}

export default useDownloadAPI;
