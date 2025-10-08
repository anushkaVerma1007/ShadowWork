const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['compress', 'hash', 'filter', 'transform'] },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  totalChunks: { type: Number, required: true },
  completedChunks: { type: Number, default: 0 },
  failedChunks: { type: Number, default: 0 },
  inputData: { type: String },
  result: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);