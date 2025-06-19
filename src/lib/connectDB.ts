import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Extend the NodeJS.Global interface to include mongoose
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
} else {
}

async function connectDB(): Promise<typeof mongoose> {

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    // console.log("No cached promise found, creating new connection promise");

    cached!.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongoose) => {
        // console.log("MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  } else {
    // console.log("Using existing cached promise for connection");
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    console.error("Error while awaiting connection promise:", e);
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectDB;
