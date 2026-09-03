const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for downloads
const downloadStore = new Map();
let downloadIdCounter = 1;

// Mock database of available files
const availableFiles = [
  { id: 1, name: 'video-4k.mp4', size: 2500, url: 'https://example.com/video-4k.mp4' },
  { id: 2, name: 'design-files.zip', size: 850, url: 'https://example.com/design-files.zip' },
  { id: 3, name: 'database-backup.sql', size: 1200, url: 'https://example.com/database.sql' },
  { id: 4, name: 'project-docs.pdf', size: 450, url: 'https://example.com/docs.pdf' },
  { id: 5, name: 'software-setup.exe', size: 3100, url: 'https://example.com/setup.exe' }
];

// Routes

// Get available files
app.get('/api/files', (req, res) => {
  res.json({
    success: true,
    data: availableFiles
  });
});

// Create a new download
app.post('/api/downloads', (req, res) => {
  const { fileId } = req.body;
  
  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: 'fileId is required'
    });
  }

  const file = availableFiles.find(f => f.id === fileId);
  if (!file) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  const downloadId = downloadIdCounter++;
  const download = {
    id: downloadId,
    fileId,
    name: file.name,
    size: file.size,
    url: file.url,
    downloaded: 0,
    progress: 0,
    speed: 0,
    status: 'pending',
    startTime: null,
    pausedTime: null,
    createdAt: new Date()
  };

  downloadStore.set(downloadId, download);

  res.json({
    success: true,
    message: 'Download created successfully',
    data: download
  });
});

// Get all downloads
app.get('/api/downloads', (req, res) => {
  const downloads = Array.from(downloadStore.values());
  res.json({
    success: true,
    data: downloads,
    count: downloads.length
  });
});

// Get single download
app.get('/api/downloads/:id', (req, res) => {
  const { id } = req.params;
  const download = downloadStore.get(Number(id));

  if (!download) {
    return res.status(404).json({
      success: false,
      message: 'Download not found'
    });
  }

  res.json({
    success: true,
    data: download
  });
});

// Start/Resume download
app.post('/api/downloads/:id/start', (req, res) => {
  const { id } = req.params;
  const download = downloadStore.get(Number(id));

  if (!download) {
    return res.status(404).json({
      success: false,
      message: 'Download not found'
    });
  }

  if (download.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Download already completed'
    });
  }

  download.status = 'downloading';
  download.startTime = new Date();

  // Simulate progressive download
  simulateDownload(Number(id));

  res.json({
    success: true,
    message: 'Download started',
    data: download
  });
});

// Pause download
app.post('/api/downloads/:id/pause', (req, res) => {
  const { id } = req.params;
  const download = downloadStore.get(Number(id));

  if (!download) {
    return res.status(404).json({
      success: false,
      message: 'Download not found'
    });
  }

  if (download.status !== 'downloading') {
    return res.status(400).json({
      success: false,
      message: 'Download is not in progress'
    });
  }

  download.status = 'paused';
  download.pausedTime = new Date();

  res.json({
    success: true,
    message: 'Download paused',
    data: download
  });
});

// Resume download
app.post('/api/downloads/:id/resume', (req, res) => {
  const { id } = req.params;
  const download = downloadStore.get(Number(id));

  if (!download) {
    return res.status(404).json({
      success: false,
      message: 'Download not found'
    });
  }

  if (download.status !== 'paused') {
    return res.status(400).json({
      success: false,
      message: 'Download is not paused'
    });
  }

  download.status = 'downloading';
  simulateDownload(Number(id));

  res.json({
    success: true,
    message: 'Download resumed',
    data: download
  });
});

// Cancel download
app.post('/api/downloads/:id/cancel', (req, res) => {
  const { id } = req.params;
  const download = downloadStore.get(Number(id));

  if (!download) {
    return res.status(404).json({
      success: false,
      message: 'Download not found'
    });
  }

  downloadStore.delete(Number(id));

  res.json({
    success: true,
    message: 'Download cancelled and removed',
    data: { id: Number(id) }
  });
});

// Delete download (after completion)
app.delete('/api/downloads/:id', (req, res) => {
  const { id } = req.params;
  const download = downloadStore.get(Number(id));

  if (!download) {
    return res.status(404).json({
      success: false,
      message: 'Download not found'
    });
  }

  downloadStore.delete(Number(id));

  res.json({
    success: true,
    message: 'Download deleted successfully',
    data: { id: Number(id) }
  });
});

// Get download statistics
app.get('/api/downloads/stats/summary', (req, res) => {
  const downloads = Array.from(downloadStore.values());
  
  const stats = {
    total: downloads.length,
    pending: downloads.filter(d => d.status === 'pending').length,
    downloading: downloads.filter(d => d.status === 'downloading').length,
    paused: downloads.filter(d => d.status === 'paused').length,
    completed: downloads.filter(d => d.status === 'completed').length,
    failed: downloads.filter(d => d.status === 'failed').length,
    totalSize: downloads.reduce((sum, d) => sum + d.size, 0),
    totalDownloaded: downloads.reduce((sum, d) => sum + d.downloaded, 0),
    averageSpeed: calculateAverageSpeed(downloads)
  };

  res.json({
    success: true,
    data: stats
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Simulate download progress
function simulateDownload(downloadId) {
  const download = downloadStore.get(downloadId);
  if (!download || download.status !== 'downloading') return;

  const interval = setInterval(() => {
    if (download.status !== 'downloading') {
      clearInterval(interval);
      return;
    }

    // Simulate download speed (0.5 - 10 MB/s)
    const speedMBps = Math.random() * 9.5 + 0.5;
    const increment = (speedMBps / 10) * download.size; // Simulate 500ms increment

    download.downloaded += increment;
    if (download.downloaded > download.size) {
      download.downloaded = download.size;
    }

    download.progress = (download.downloaded / download.size) * 100;
    download.speed = speedMBps.toFixed(1);

    // Check if download is complete
    if (download.progress >= 100) {
      download.progress = 100;
      download.status = 'completed';
      clearInterval(interval);
    }
  }, 500);
}

function calculateAverageSpeed(downloads) {
  const activeDownloads = downloads.filter(d => d.status === 'downloading');
  if (activeDownloads.length === 0) return 0;
  
  const totalSpeed = activeDownloads.reduce((sum, d) => sum + parseFloat(d.speed || 0), 0);
  return (totalSpeed / activeDownloads.length).toFixed(1);
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Download Manager API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
