const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('your_username')) {
    console.error('⚠️  MONGO_URI not set in .env — please update backend/.env with your MongoDB connection string');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will keep running but API calls needing DB will fail gracefully.');
  }
};

module.exports = connectDB;
