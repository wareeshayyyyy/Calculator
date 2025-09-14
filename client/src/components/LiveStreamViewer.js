import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import config from '../config';

const LiveStreamViewer = () => {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to server to receive live streams
    const socketConnection = io(config.SOCKET_URL);
    setSocket(socketConnection);

    // Listen for live stream updates
    socketConnection.on('live-stream-data', (data) => {
      console.log('Received live stream data:', data);
      
      // Create blob URL from received video data
      if (data.videoChunk) {
        const blob = new Blob([data.videoChunk], { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        setStreams(prev => [...prev, {
          id: data.sessionId,
          timestamp: data.timestamp,
          url: url,
          connectionId: data.connectionId
        }]);
      }
    });

    // Listen for active sessions
    socketConnection.on('active-sessions', (sessions) => {
      console.log('Active recording sessions:', sessions);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const viewStream = (stream) => {
    setSelectedStream(stream);
    if (videoRef.current) {
      videoRef.current.src = stream.url;
    }
  };

  return (
    <div className="live-stream-viewer">
      <div className="viewer-header">
        <h2>🎥 Live Stream Monitor</h2>
        <p>Monitoring incoming video streams from shared calculator links</p>
      </div>

      <div className="stream-grid">
        <div className="stream-list">
          <h3>Recent Recordings ({streams.length})</h3>
          <div className="stream-items">
            {streams.map((stream, index) => (
              <div 
                key={index} 
                className={`stream-item ${selectedStream?.id === stream.id ? 'active' : ''}`}
                onClick={() => viewStream(stream)}
              >
                <div className="stream-info">
                  <strong>Session: {stream.id}</strong>
                  <small>{new Date(stream.timestamp).toLocaleString()}</small>
                  <span className="connection-id">ID: {stream.connectionId}</span>
                </div>
              </div>
            ))}
            {streams.length === 0 && (
              <div className="no-streams">
                <p>No recordings yet. Share your calculator link!</p>
                <div className="share-info">
                  <p>Share this link:</p>
                  <code>{window.location.origin}</code>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="video-player">
          {selectedStream ? (
            <div className="player-container">
              <video
                ref={videoRef}
                controls
                autoPlay
                className="main-video"
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can play')}
              />
              <div className="video-info">
                <h4>Session: {selectedStream.id}</h4>
                <p>Recorded: {new Date(selectedStream.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              <div className="placeholder-content">
                <h3>📺 Live Stream Monitor</h3>
                <p>Select a recording from the left to view</p>
                <div className="status-indicator">
                  <div className="pulse-dot"></div>
                  <span>Monitoring active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .live-stream-viewer {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 20px;
        }

        .viewer-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .viewer-header h2 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
        }

        .stream-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .stream-list {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        .stream-list h3 {
          margin: 0 0 20px 0;
          color: #fff;
        }

        .stream-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .stream-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        .stream-item.active {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
        }

        .stream-info strong {
          display: block;
          margin-bottom: 5px;
        }

        .stream-info small {
          color: #ccc;
          display: block;
        }

        .connection-id {
          font-family: 'Courier New', monospace;
          font-size: 0.8em;
          color: #00ff88;
        }

        .video-player {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 15px;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        .main-video {
          width: 100%;
          max-height: 400px;
          border-radius: 10px;
          background: #000;
        }

        .video-info {
          margin-top: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .placeholder-content {
          text-align: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          background: #00ff88;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .no-streams {
          text-align: center;
          padding: 40px 20px;
          color: #ccc;
        }

        .share-info {
          margin-top: 20px;
          padding: 15px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }

        .share-info code {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          border-radius: 5px;
          font-family: 'Courier New', monospace;
          display: inline-block;
          margin-top: 10px;
        }

        @media (max-width: 768px) {
          .stream-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveStreamViewer;
