import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

const MONGODB_URI = process.env.MONGODB_URI;

const DBConnect = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Connection error:", error);
    process.exit(1);
  }
};

export default DBConnect;