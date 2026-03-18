const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured in environment variables");
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("[NotificationService] MongoDB connected successfully");
  } catch (error) {
    console.error("[NotificationService] MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
