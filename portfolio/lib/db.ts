import mongoose from "mongoose";

/**
 * Mongo connection helper. Caches the connection on `globalThis` so
 * Next.js HMR doesn't open a new connection on every reload.
 *
 * The env check is INSIDE `dbConnect` (not at module top-level) so that
 * `next build`'s page-data collection doesn't crash when MONGODB_URI
 * isn't set in the build environment. The connection is only opened
 * when something actually queries the DB.
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongo = globalThis as unknown as { mongoose?: MongooseCache };
const cached: MongooseCache =
  globalForMongo.mongoose ??
  (globalForMongo.mongoose = { conn: null, promise: null });

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Add it to .env.local — see .env.example for the format."
      );
    }
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
