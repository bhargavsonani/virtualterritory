const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Fix DNS resolution for MongoDB Atlas (important for Windows)
dns.setDefaultResultOrder('ipv4first');

const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const mongodbUri = process.env.MONGODB_URI;

      if (!mongodbUri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      const conn = await mongoose.connect(mongodbUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return true;

    } catch (error) {
      console.error(`❌ MongoDB Connection Attempt ${i + 1}/${retries} Failed: ${error.message}`);

      if (i < retries - 1) {
        console.log(`⏳ Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.error('💡 MongoDB connection failed. Server will still run but DB will not work.');
  console.error('💡 Check MongoDB Atlas Network Access (allow your IP)');
  return false;
};

module.exports = connectDB;