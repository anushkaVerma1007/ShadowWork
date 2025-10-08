const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  chunkId: { type: String, required: true, unique: true },
  jobId: { type: String, required: true, ref: 'Job' },
  chunkIndex: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'assigned', 'processing', 'completed', 'failed'], default: 'pending' },
  assignedTo: { type: String, ref: 'Device' },
  data: { type: mongoose.Schema.Types.Mixed },
  result: { type: mongoose.Schema.Types.Mixed },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Chunk', chunkSchema);