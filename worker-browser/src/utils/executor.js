// Task execution logic for different job types

class Executor {
  static async execute(type, data) {
    try {
      switch (type) {
        case 'compress':
          return await this.compress(data);
        
        case 'hash':
          return await this.hash(data);
        
        case 'filter':
          return await this.filter(data);
        
        case 'transform':
          return await this.transform(data);
        
        default:
          throw new Error(`Unknown task type: ${type}`);
      }
    } catch (error) {
      throw new Error(`Execution failed: ${error.message}`);
    }
  }

  static async compress(data) {
    // Simulate compression
    await this.delay(500 + Math.random() * 1000);
    const compressed = Buffer.from(data).toString('base64');
    return compressed.substring(0, Math.floor(compressed.length * 0.7));
  }

  static async hash(data) {
    // Simple hash simulation
    await this.delay(300 + Math.random() * 700);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  static async filter(data) {
    // Filter out non-alphanumeric characters
    await this.delay(200 + Math.random() * 500);
    return data.replace(/[^a-zA-Z0-9]/g, '');
  }

  static async transform(data) {
    // Transform to uppercase and add prefix
    await this.delay(100 + Math.random() * 300);
    return `PROCESSED_${data.toUpperCase()}`;
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Executor;