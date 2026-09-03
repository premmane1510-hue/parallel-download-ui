import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Play, Pause } from "lucide-react";
import "./DownloadItem.css";

function DownloadItem({ download, onDownload, onCancel, onPause, onResume }) {
  const statusColor = {
    pending: "#999",
    downloading: "#2196f3",
    paused: "#ff9800",
    completed: "#4caf50",
    failed: "#f44336"
  };

  return (
    <motion.div
      className="download-item"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* File Info */}
      <div className="download-header">
        <div className="file-info">
          <div className="file-name">{download.name}</div>
          <div className="file-size">
            {download.downloaded} / {download.size} MB
          </div>
        </div>
        <div className="download-status">
          <span className="status-text">{download.status}</span>
          <span className="status-percentage">
            {Math.round(download.progress)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <motion.div
          className="progress-bar"
          style={{
            background: statusColor[download.status],
            boxShadow: `0 0 10px ${statusColor[download.status]}80`
          }}
          animate={{ width: `${download.progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <div className="progress-text">
          {download.status === "completed" ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              ✅ Completed
            </motion.span>
          ) : download.status === "failed" ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              ❌ Failed
            </motion.span>
          ) : (
            <span>{download.speed} MB/s</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions">
        <AnimatePresence mode="wait">
          {download.status === "completed" || download.status === "failed" ? (
            <motion.button
              key="delete"
              onClick={() => onCancel(download.id)}
              className="btn btn-danger"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 size={16} />
            </motion.button>
          ) : download.status === "pending" ? (
            <motion.button
              key="start"
              onClick={() => onDownload(download.id)}
              className="btn btn-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={16} /> Start
            </motion.button>
          ) : download.status === "downloading" ? (
            <motion.button
              key="pause"
              onClick={() => onPause(download.id)}
              className="btn btn-warning"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pause size={16} /> Pause
            </motion.button>
          ) : (
            <motion.button
              key="resume"
              onClick={() => onResume(download.id)}
              className="btn btn-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={16} /> Resume
            </motion.button>
          )}
        </AnimatePresence>

        {(download.status === "downloading" || download.status === "paused") && (
          <motion.button
            onClick={() => onCancel(download.id)}
            className="btn btn-secondary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default DownloadItem;
