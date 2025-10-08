const Device = require('../models/Device');
const Chunk = require('../models/Chunk');
const Aggregator = require('../services/aggregator');

module.exports = (io, scheduler) => {
  const aggregator = new Aggregator(io);

  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Device registration
    socket.on('register-device', async (data) => {
      try {
        const { deviceId, name, systemInfo } = data;

        let device = await Device.findOne({ deviceId });
        
        if (device) {
          device.status = 'online';
          device.lastHeartbeat = new Date();
        } else {
          device = new Device({
            deviceId,
            name,
            systemInfo,
            status: 'online',
          });
        }
        
        await device.save();
        socket.join(deviceId);
        socket.deviceId = deviceId;

        socket.emit('registration-success', { deviceId, name });
        io.emit('device-update', { devices: await Device.find() });

        console.log(`✅ Device registered: ${name} (${deviceId})`);
      } catch (error) {
        console.error('Registration error:', error);
        socket.emit('registration-error', { error: error.message });
      }
    });

    // Heartbeat
    socket.on('heartbeat', async (data) => {
      try {
        const device = await Device.findOne({ deviceId: data.deviceId });
        if (device) {
          device.lastHeartbeat = new Date();
          device.currentLoad = data.load || device.currentLoad;
          await device.save();
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    });

    // Task completion
    socket.on('task-completed', async (data) => {
      try {
        const { chunkId, result } = data;
        
        const chunk = await Chunk.findOne({ chunkId });
        if (!chunk) {
          return socket.emit('error', { message: 'Chunk not found' });
        }

        chunk.status = 'completed';
        chunk.result = result;
        chunk.completedAt = new Date();
        await chunk.save();

        const device = await Device.findOne({ deviceId: socket.deviceId });
        if (device) {
          device.tasksCompleted += 1;
          device.currentLoad = Math.max(0, device.currentLoad - 20);
          await device.save();
        }

        io.emit('chunk-completed', { chunkId, jobId: chunk.jobId });
        console.log(`✅ Chunk ${chunkId} completed`);

        // Check if job is complete
        await aggregator.checkJobCompletion(chunk.jobId);

        // Trigger next task distribution
        setTimeout(() => scheduler.distributeTasks(), 500);
      } catch (error) {
        console.error('Task completion error:', error);
      }
    });

    // Task failure
    socket.on('task-failed', async (data) => {
      try {
        const { chunkId, error } = data;
        
        const chunk = await Chunk.findOne({ chunkId });
        if (!chunk) return;

        if (chunk.attempts >= 3) {
          chunk.status = 'failed';
          await chunk.save();
          console.log(`❌ Chunk ${chunkId} failed permanently`);
        } else {
          chunk.status = 'pending';
          chunk.assignedTo = null;
          await chunk.save();
          console.log(`🔄 Chunk ${chunkId} will be retried`);
        }

        const device = await Device.findOne({ deviceId: socket.deviceId });
        if (device) {
          device.currentLoad = Math.max(0, device.currentLoad - 20);
          await device.save();
        }
      } catch (error) {
        console.error('Task failure error:', error);
      }
    });

    // Disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
      
      if (socket.deviceId) {
        try {
          const device = await Device.findOne({ deviceId: socket.deviceId });
          if (device) {
            device.status = 'offline';
            await device.save();
            
            io.emit('device-update', { devices: await Device.find() });
            
            // Reassign tasks
            await scheduler.reassignFailedTasks(socket.deviceId);
          }
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      }
    });
  });
};