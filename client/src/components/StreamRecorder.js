import React, { useState, useRef, useCallback } from 'react';
import config from '../config';

const StreamRecorder = ({ mediaStream, connectionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunkIndexRef = useRef(0);

  const startRecording = useCallback(() => {
    if (!mediaStream) return;

    const mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });

    mediaRecorderRef.current = mediaRecorder;
    setRecordedChunks([]);
    chunkIndexRef.current = 0;

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        // Upload chunk to server immediately
        const formData = new FormData();
        formData.append('video', event.data, `chunk-${chunkIndexRef.current}.webm`);
        formData.append('connectionId', connectionId);
        formData.append('timestamp', new Date().toISOString());
        formData.append('chunkIndex', chunkIndexRef.current);

        try {
          const response = await fetch(`${config.API_URL}/api/upload-chunk`, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            console.log(`Chunk ${chunkIndexRef.current} uploaded successfully`);
            chunkIndexRef.current++;
          }
        } catch (error) {
          console.error('Error uploading chunk:', error);
        }
      }
    };

    mediaRecorder.onstart = () => {
      setIsRecording(true);
      console.log('Recording started for connection:', connectionId);
    };

    mediaRecorder.onstop = async () => {
      setIsRecording(false);
      console.log('Recording stopped');
      
      // Notify server that recording ended
      try {
        await fetch(`${config.API_URL}/api/recordings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            connectionId,
            endTime: new Date().toISOString(),
            status: 'completed',
            totalChunks: chunkIndexRef.current
          })
        });
      } catch (error) {
        console.error('Error updating recording status:', error);
      }
    };

    // Start recording with 5-second chunks
    mediaRecorder.start(5000);
  }, [mediaStream, connectionId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return (
    <div className="stream-recorder">
      <div className="recording-controls">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!mediaStream}
          className={`record-button ${isRecording ? 'recording' : ''}`}
        >
          {isRecording ? (
            <>
              <div className="recording-indicator"></div>
              Stop Recording
            </>
          ) : (
            'Start Recording'
          )}
        </button>
        
        {isRecording && (
          <div className="recording-info">
            <span className="recording-text">Recording...</span>
            <div className="recording-pulse"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        .stream-recorder {
          margin: 10px 0;
        }

        .recording-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .record-button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background: #f44336;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .record-button:hover:not(:disabled) {
          background: #d32f2f;
          transform: translateY(-1px);
        }

        .record-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .record-button.recording {
          background: #ff5722;
          animation: pulse-red 2s infinite;
        }

        .recording-indicator {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          animation: blink 1s infinite;
        }

        .recording-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f44336;
          font-weight: bold;
        }

        .recording-pulse {
          width: 10px;
          height: 10px;
          background: #f44336;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        @keyframes pulse-red {
          0% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default StreamRecorder;
