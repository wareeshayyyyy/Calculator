const express = require('express');
const router = express.Router();
const Stream = require('../models/Stream');

// Create a new stream
router.post('/streams', async (req, res) => {
  try {
    const { title, broadcaster } = req.body;
    const stream = new Stream({
      streamKey: process.env.STREAM_KEY,
      title,
      broadcaster
    });
    await stream.save();
    res.status(201).json(stream);
  } catch (error) {
    res.status(500).json({ error: 'Error creating stream' });
  }
});

// Get all active streams
router.get('/streams', async (req, res) => {
  try {
    const streams = await Stream.find({ status: 'live' });
    res.json(streams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching streams' });
  }
});

// Get stream by streamKey
router.get('/streams/:streamKey', async (req, res) => {
  try {
    const stream = await Stream.findOne({ streamKey: req.params.streamKey });
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    res.json(stream);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stream' });
  }
});

// Update stream viewers
router.patch('/streams/:streamKey/viewers', async (req, res) => {
  try {
    const { viewerId, action } = req.body;
    const stream = await Stream.findOne({ streamKey: req.params.streamKey });
    
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (action === 'add') {
      if (!stream.viewers.includes(viewerId)) {
        stream.viewers.push(viewerId);
      }
    } else if (action === 'remove') {
      stream.viewers = stream.viewers.filter(v => v !== viewerId);
    }

    await stream.save();
    res.json(stream);
  } catch (error) {
    res.status(500).json({ error: 'Error updating stream viewers' });
  }
});

// End stream
router.patch('/streams/:streamKey/end', async (req, res) => {
  try {
    const stream = await Stream.findOne({ streamKey: req.params.streamKey });
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    stream.status = 'ended';
    stream.endedAt = new Date();
    await stream.save();
    
    res.json(stream);
  } catch (error) {
    res.status(500).json({ error: 'Error ending stream' });
  }
});

module.exports = router;