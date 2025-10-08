const io = require('socket.io-client');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const Executor = require('./utils/executor');

class WorkerAgent {
  constructor(serverUrl = 'http://localhost:5000') {
    this.serverUrl = serverUrl;
    this.deviceId = uuidv4();
    this.deviceName = `${os.hostname()}-worker`;
    this.socket = null;
    this.isProcessing = false;
    this.currentTask = null;
  }

  connect() {
    this.socket = io(this.serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to ShadowWork server');
      this.register();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      this.isProcessing = false;
    });

    this.socket.on('registration-success', (data) => {
      console.log(`✅ Registered as: ${data.name} (${data.deviceId})`);
      this.startHeartbeat();
    });

    this.socket.on('registration-error', (data) => {
      console.error('❌ Registration failed:', data.error);
    });

    this.socket.on('task-assigned', async (task) => {
      console.log(`📥 Received task: ${task.chunkId}`);
      await this.processTask(task);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Server error:', error.message);
    });
  }

  register() {
    const systemInfo = {
      platform: os.platform(),
      cpuCores: os.cpus().length,
      memory: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
    };

    this.socket.emit('register-device', {
      deviceId: this.deviceId,
      name: this.deviceName,
      systemInfo,
    });
  }

  startHeartbeat() {
    setInterval(() => {
      const loadAvg = os.loadavg()[0];
      const load = Math.min(100, Math.round((loadAvg / os.cpus().length) * 100));

      this.socket.emit('heartbeat', {
        deviceId: this.deviceId,
        load: this.isProcessing ? Math.max(load, 50) : load,
      });
    }, 5000);
  }

  async processTask(task) {
    if (this.isProcessing) {
      console.log('⚠️  Already processing a task, queuing...');
      return;
    }

    this.isProcessing = true;
    this.currentTask = task;

    try {
      console.log(`🔧 Processing chunk: ${task.chunkId}`);
      console.log(`   Type: ${task.type}`);
      console.log(`   Data length: ${task.data.length}`);

      const result = await Executor.execute(task.type, task.data);

      this.socket.emit('task-completed', {
        chunkId: task.chunkId,
        result,
      });

      console.log(`✅ Task completed: ${task.chunkId}`);
    } catch (error) {
      console.error(`❌ Task failed: ${task.chunkId}`, error.message);
      
      this.socket.emit('task-failed', {
        chunkId: task.chunkId,
        error: error.message,
      });
    } finally {
      this.isProcessing = false;
      this.currentTask = null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('👋 Disconnected from server');
    }
  }
}

// Run the worker
if (require.main === module) {
  const serverUrl = process.argv[2] || 'http://localhost:5000';
  const worker = new WorkerAgent(serverUrl);
  
  console.log('🚀 Starting ShadowWork Worker Agent...');
  console.log(`   Server: ${serverUrl}`);
  console.log(`   Device: ${worker.deviceName}`);
  console.log('');
  
  worker.connect();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down worker...');
    worker.disconnect();
    process.exit(0);
  });
}

module.exports = WorkerAgent;