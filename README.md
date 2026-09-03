# Parallel Download Manager with Backend API Integration

A full-stack application for managing parallel downloads with real-time progress tracking, built with React and Express.js.

## Features

✅ **Parallel Downloads** - Download multiple files simultaneously  
✅ **Real-time Progress** - Live progress tracking with animated UI  
✅ **Start/Pause/Resume** - Control each download independently  
✅ **Backend API** - Express.js REST API for download management  
✅ **Statistics Dashboard** - Real-time download statistics  
✅ **Dark Mode** - Toggle between light and dark themes  
✅ **Search & Filter** - Find downloads by name and status  
✅ **Responsive Design** - Works on desktop and mobile  

## Tech Stack

**Frontend:**
- React + Framer Motion (animations)
- Axios (API client)
- CSS3 Grid & Flexbox

**Backend:**
- Node.js + Express.js
- REST API
- In-memory data store

## Project Structure

```
parallel-download-ui/
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   ├── DownloadItemCard.jsx
│   │   └── MultiDownloadManager.css
│   ├── services/
│   │   └── api.js                 # API client
│   ├── hooks/
│   │   └── useDownloadAPI.js      # Custom hook for API integration
│   └── App.css
├── server/
│   ├── server.js                  # Express.js server
│   ├── package.json
│   └── .env.example
├── .env.example
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
# In root directory
npm install

# Create .env file
cp .env.example .env

# Start the React app
npm start
# App runs on http://localhost:3000
```

## API Endpoints

### Files
- `GET /api/files` - Get available files for download

### Downloads
- `GET /api/downloads` - Get all downloads
- `GET /api/downloads/:id` - Get single download
- `POST /api/downloads` - Create new download
- `POST /api/downloads/:id/start` - Start download
- `POST /api/downloads/:id/pause` - Pause download
- `POST /api/downloads/:id/resume` - Resume download
- `POST /api/downloads/:id/cancel` - Cancel download
- `DELETE /api/downloads/:id` - Delete download
- `GET /api/downloads/stats/summary` - Get download statistics
- `GET /api/health` - Health check

## API Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

## Error Handling

- Connection status monitoring (shows connection indicator)
- Toast notifications for user feedback
- Automatic reconnection attempts
- Detailed error messages

## Usage

1. **Add Download**: Click "+ Add Download" to add a file from the available list
2. **Start Download**: Click "Start" to begin downloading
3. **Pause/Resume**: Pause downloads and resume them later
4. **Cancel**: Cancel ongoing downloads
5. **Delete**: Remove completed downloads
6. **Search & Filter**: Use search and status filters to find downloads

## Customization

### Change API URL
Edit `.env`:
```
REACT_APP_API_URL=http://your-api-url:5000/api
```

### Change Server Port
Edit `server/.env`:
```
PORT=3001
```

### Add Real File Downloads
Replace mock files in `server/server.js` with actual file URLs

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Download history export
- [ ] Scheduled downloads
- [ ] File verification (checksums)
- [ ] Concurrent connection limits
- [ ] Bandwidth throttling
- [ ] WebSocket for real-time updates
- [ ] Mobile app (React Native)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
