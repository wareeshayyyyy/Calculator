import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';

const StreamViewer = () => {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStreams();
    // Poll for new streams every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/streams');
      setStreams(response.data);
    } catch (err) {
      setError('Failed to fetch streams');
      console.error('Error fetching streams:', err);
    }
  };

  const handleStreamSelect = async (stream) => {
    try {
      // Add viewer to stream
      await axios.patch(`http://localhost:5000/api/streams/${stream.streamKey}/viewers`, {
        viewerId: 'viewer-' + Math.random(), // In a real app, use actual user ID
        action: 'add'
      });
      setSelectedStream(stream);
    } catch (err) {
      setError('Failed to join stream');
      console.error('Error joining stream:', err);
    }
  };

  const streamUrl = selectedStream
    ? `rtmp://localhost:1935/live/${selectedStream.streamKey}`
    : '';

  return (
    <div className="stream-viewer">
      <h2>Live Streams</h2>
      
      {error && <div className="error">{error}</div>}

      <div className="streams-list">
        {streams.map(stream => (
          <div 
            key={stream._id} 
            className={`stream-item ${selectedStream?._id === stream._id ? 'selected' : ''}`}
            onClick={() => handleStreamSelect(stream)}
          >
            <h3>{stream.title}</h3>
            <p>Broadcaster: {stream.broadcaster}</p>
            <p>Viewers: {stream.viewers.length}</p>
          </div>
        ))}
        {streams.length === 0 && <p>No active streams</p>}
      </div>

      {selectedStream && (
        <div className="video-player">
          <h3>Watching: {selectedStream.title}</h3>
          <ReactPlayer
            url={streamUrl}
            playing
            controls
            width="100%"
            height="500px"
          />
        </div>
      )}

      <style jsx>{`
        .stream-viewer {
          padding: 20px;
        }

        .streams-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .stream-item {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .stream-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stream-item.selected {
          border-color: #0066cc;
          background-color: #f0f7ff;
        }

        .video-player {
          margin-top: 20px;
        }

        .error {
          color: red;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
};

export default StreamViewer;