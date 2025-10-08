const Chunk = require('../models/Chunk');
const Device = require('../models/Device');
const Job = require('../models/Job');

class Scheduler {
  constructor(io) {
    this.io = io;
    this.MAX_RETRIES = 3;
  }

  // Assign pending chunks to available devices
  async distributeTasks() {
    try {
      const pendingChunks = await Chunk.find({ 
        status: 'pending',
        attempts: { $lt: this.MAX_RETRIES }
      }).limit(10);

      const availableDevices = await Device.find({ 
        status: 'online',
        currentLoad: { $lt: 80 }
      }).sort({ currentLoad: 1 });

      if (pendingChunks.length === 0 || availableDevices.length === 0) {
        return;
      }

      for (let i = 0; i < pendingChunks.length && i < availableDevices.length; i++) {
        const chunk = pendingChunks[i];
        const device = availableDevices[i % availableDevices.length];

        await this.assignChunkToDevice(chunk, device);
      }
    } catch (error) {
      console.error('Error distributing tasks:', error);
    }
  }

  async assignChunkToDevice(chunk, device) {
    try {
      chunk.status = 'assigned';
      chunk.assignedTo = device.deviceId;
      chunk.attempts += 1;
      await chunk.save();

      device.currentLoad = Math.min(100, device.currentLoad + 20);
      await device.save();

      // Send task to device via WebSocket
      this.io.to(device.deviceId).emit('task-assigned', {
        chunkId: chunk.chunkId,
        jobId: chunk.jobId,
        data: chunk.data,
        type: await this.getJobType(chunk.jobId),
      });

      console.log(`✅ Assigned ${chunk.chunkId} to ${device.name}`);
    } catch (error) {
      console.error('Error assigning chunk:', error);
    }
  }

  async getJobType(jobId) {
    const job = await Job.findOne({ jobId });
    return job ? job.type : 'unknown';
  }

  // Reassign chunks from failed/disconnected devices
  async reassignFailedTasks(deviceId) {
    try {
      const failedChunks = await Chunk.find({
        assignedTo: deviceId,
        status: { $in: ['assigned', 'processing'] }
      });

      for (const chunk of failedChunks) {
        chunk.status = 'pending';
        chunk.assignedTo = null;
        await chunk.save();
        console.log(`🔄 Reassigned ${chunk.chunkId} from disconnected device`);
      }

      if (failedChunks.length > 0) {
        setTimeout(() => this.distributeTasks(), 2000);
      }
    } catch (error) {
      console.error('Error reassigning tasks:', error);
    }
  }

  // Start periodic task distribution
  startScheduler() {
    setInterval(() => {
      this.distributeTasks();
    }, 3000);
    console.log('📋 Scheduler started');
  }
}

module.exports = Scheduler;