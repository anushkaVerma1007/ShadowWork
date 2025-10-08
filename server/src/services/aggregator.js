const Job = require('../models/Job');
const Chunk = require('../models/Chunk');

class Aggregator {
  constructor(io) {
    this.io = io;
  }

  async checkJobCompletion(jobId) {
    try {
      const job = await Job.findOne({ jobId });
      if (!job || job.status === 'completed') return;

      const chunks = await Chunk.find({ jobId });
      const completedChunks = chunks.filter(c => c.status === 'completed');

      job.completedChunks = completedChunks.length;

      if (completedChunks.length === job.totalChunks) {
        // All chunks completed - aggregate results
        const aggregatedResult = await this.aggregateResults(job.type, completedChunks);
        
        job.status = 'completed';
        job.result = aggregatedResult;
        job.completedAt = new Date();
        await job.save();

        this.io.emit('job-completed', { jobId, result: aggregatedResult });
        console.log(`✅ Job ${jobId} completed`);
      } else {
        await job.save();
      }
    } catch (error) {
      console.error('Error checking job completion:', error);
    }
  }

  async aggregateResults(jobType, chunks) {
    const sortedChunks = chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
    
    switch (jobType) {
      case 'compress':
        return sortedChunks.map(c => c.result).join('');
      
      case 'hash':
        return {
          hashes: sortedChunks.map(c => c.result),
          combined: sortedChunks.map(c => c.result).join('-')
        };
      
      case 'filter':
        return sortedChunks.map(c => c.result).flat();
      
      case 'transform':
        return sortedChunks.map(c => c.result).join('\n');
      
      default:
        return sortedChunks.map(c => c.result);
    }
  }
}

module.exports = Aggregator;