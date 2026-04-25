import { MongoClient } from "mongodb";

let client: MongoClient | null = null;
let isConnected = false;

export const connectToDatabase = async (): Promise<MongoClient> => {
  if (isConnected && client) {
    return client;
  }

  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    client = new MongoClient(mongoUrl);
    await client.connect();
    isConnected = true;
    console.log("✅ Successfully connected to MongoDB");

    return client;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    isConnected = false;
    console.log("Disconnected from MongoDB");
  }
};

export const getDatabase = () => {
  if (!client || !isConnected) {
    throw new Error("Database not connected. Call connectToDatabase first.");
  }
  return client.db();
};

export const isDatabaseConnected = () => isConnected;
