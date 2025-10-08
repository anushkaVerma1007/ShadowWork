const Job = require('../models/Job');
const Chunk = require('../models/Chunk');
const { v4: uuidv4 } = require('uuid');

// Submit a new job
exports.submitJob = async (req, res) => {
  try {
    const { type, inputData, chunkCount } = req.body;

    if (!type || !inputData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const jobId = uuidv4();
    const totalChunks = chunkCount || Math.ceil(inputData.length / 100);

    // Create job
    const job = await Job.create({
      jobId,
      type,
      totalChunks,
      inputData,
    });

    // Split data into chunks
    const chunkSize = Math.ceil(inputData.length / totalChunks);
    const chunks = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, inputData.length);
      const chunkData = inputData.substring(start, end);

      const chunk = await Chunk.create({
        chunkId: `${jobId}-chunk-${i}`,
        jobId,
        chunkIndex: i,
        data: chunkData,
      });

      chunks.push(chunk);
    }

    res.status(201).json({
      success: true,
      job,
      chunks: chunks.map(c => c.chunkId),
    });

    // Trigger task distribution
    req.app.get('io').emit('new-job', { jobId, totalChunks });

  } catch (error) {
    console.error('Error submitting job:', error);
    res.status(500).json({ error: 'Failed to submit job' });
  }
};

// Get all jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId });
    const chunks = await Chunk.find({ jobId: req.params.jobId });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true, job, chunks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};