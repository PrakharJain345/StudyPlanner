import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-study-planner';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`[Database] Successfully connected to MongoDB at ${MONGODB_URI}`);
    return true;
  } catch (error) {
    console.warn(`[Database] MongoDB connection warning: ${error instanceof Error ? error.message : String(error)}`);
    console.log('[Database] Operating with resilient hybrid persistence mode.');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
