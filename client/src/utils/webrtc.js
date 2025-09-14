// WebRTC configuration
export const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ]
};

export const createPeerConnection = (config = rtcConfig) => {
  const pc = new RTCPeerConnection(config);
  
  pc.oniceconnectionstatechange = () => {
    console.log('ICE Connection State:', pc.iceConnectionState);
  };
  
  pc.onconnectionstatechange = () => {
    console.log('Connection State:', pc.connectionState);
  };

  return pc;
};