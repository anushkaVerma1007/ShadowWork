const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'busy'], default: 'online' },
  systemInfo: {
    platform: String,
    cpuCores: Number,
    memory: Number,
  },
  currentLoad: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  lastHeartbeat: { type: Date, default: Date.now },
  connectedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);