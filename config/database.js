const mongoose = require('mongoose');

/**
 * Database connection configuration
 * Handles MongoDB connection with proper error handling and reconnection logic
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB database
   * @param {string} uri - MongoDB connection URI
   * @returns {Promise<void>}
   */
  async connect(uri = process.env.MONGODB_URI) {
    try {
      // Connection options for production-ready setup
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        // Removed deprecated options: useNewUrlParser and useUnifiedTopology
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(uri, options);
      
      console.log(`✅ MongoDB Connected: ${this.connection.connection.host}`);
      
      // Handle connection events
      this.setupEventHandlers();
      
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Setup database event handlers
   */
  setupEventHandlers() {
    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('📡 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error.message);
    }
  }

  /**
   * Get connection status
   * @returns {string} Connection status
   */
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Check if database is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
module.exports = new Database();
