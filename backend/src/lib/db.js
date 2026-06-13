import mongoose from "mongoose";
import { ENV } from "./env.js";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectDB = async () => {
  try {
    const { MONGO_URI } = ENV;
    if (!MONGO_URI) throw new Error("MONGO_URI is not set");

    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log("MONGODB CONNECTED:", conn.connection.host);
  } catch (error) {
    console.error("Error connection to MONGODB:", error.message);
    console.error("IMPORTANT: Your current IP address is likely not whitelisted on MongoDB Atlas.");
    console.log("Starting an in-memory database fallback so the backend can run anyway...");

    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log("MONGODB CONNECTED:", conn.connection.host, "(Local In-Memory Fallback)");
    } catch (fallbackError) {
      console.error("Fallback connection also failed:", fallbackError.message);
    }
  }
};
