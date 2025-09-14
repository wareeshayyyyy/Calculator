const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  streamKey: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  broadcaster: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['live', 'ended'],
    default: 'live'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  viewers: [{
    type: String  // Store viewer IDs or usernames
  }]
});

module.exports = mongoose.model('Stream', streamSchema);