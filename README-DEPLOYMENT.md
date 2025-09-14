# 🚀 Calculator Media App - Complete Deployment Guide

## 📋 Quick Start Options

### Option 1: Instant HTTPS with ngrok (Recommended for Testing)
1. **Run the setup script:**
   ```bash
   start-ngrok.bat
   ```
2. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)
3. **Share the link:** `https://abc123.ngrok.io?conn=conn_1757792446599_eaf9kqyuf`
4. **Friend clicks link** → Camera permissions popup → Connected!

### Option 2: Deploy to Vercel (Production)

#### Step 1: Prepare for Deployment
```bash
npm run install-all
npm run build
```

#### Step 2: Deploy to Vercel
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://your-app.vercel.app/api
   REACT_APP_SOCKET_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

## 🎥 File Server Features

### Live Stream Recording
- **Auto-Recording**: Streams are automatically recorded in 5-second chunks
- **File Storage**: Videos stored in `/uploads` directory (local) or `/tmp/uploads` (production)
- **Connection-Based**: Each connection ID gets separate recording files
- **Real-time Upload**: Chunks uploaded to server immediately during streaming

### File Management
- **Access Recordings**: `http://your-url/uploads/conn_123456789_abc123-timestamp.webm`
- **Storage Location**: 
  - Local: `./uploads/`
  - Production: `/tmp/uploads/`
- **Supported Formats**: WebM with VP8/Opus codecs

## 🔗 Sharing Options

### Local Network Sharing
- **Your IP**: `http://192.168.100.17:3000?conn=your-connection-id`
- **Requirements**: Same Wi-Fi network
- **Camera Issue**: Use browser flags or ngrok for permissions

### Internet Sharing (ngrok)
- **HTTPS Tunnel**: `https://random123.ngrok.io?conn=your-connection-id`
- **Global Access**: Works from anywhere
- **Instant Permissions**: Camera/microphone popup works immediately

### Production Sharing (Vercel)
- **Permanent URL**: `https://your-app.vercel.app?conn=your-connection-id`
- **Custom Domain**: Configure in Vercel dashboard
- **Reliable**: 99.9% uptime, global CDN

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run install-all

# Start both client and server
npm run dev

# Start ngrok tunnel
npm run ngrok

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

## 🎯 Connection Flow

1. **Host**: Starts camera → Generates link → Shares with friend
2. **Friend**: Opens link → Allows permissions → Connected
3. **Recording**: Automatically starts saving live streams
4. **File Storage**: Video chunks saved to server
5. **Playback**: Access recordings via `/uploads/` URL

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `client/src/config.js` - Environment-specific URLs
- `package.json` - Root package with deployment scripts
- `start-ngrok.bat` - One-click ngrok setup

## 📁 File Structure

```
calculator-media-app/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── uploads/               # Local video storage
├── vercel.json           # Vercel config
├── start-ngrok.bat       # ngrok launcher
└── README-DEPLOYMENT.md  # This file
```

## 🚨 Security Notes

- **ngrok**: Free tier has session limits
- **File Storage**: Videos are accessible via direct URL
- **Production**: Use authentication for sensitive streams
- **HTTPS**: Required for camera/microphone permissions

## ✅ Success Checklist

- [ ] ngrok tunnel running
- [ ] Both services started (client + server)
- [ ] HTTPS URL copied and shared
- [ ] Friend can access link
- [ ] Camera/microphone permissions granted
- [ ] Live streaming working
- [ ] Recording saving to server
- [ ] Files accessible in `/uploads`

**Your calculator media app is now ready for sharing! 🎉**
