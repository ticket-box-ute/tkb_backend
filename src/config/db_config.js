require("dotenv").config();
const mongoose = require("mongoose");

async function connect() {
  try {
    const DB_HOST = process.env.DB_HOST || "127.0.0.1";
    const DB_PORT = process.env.DB_PORT || "27017";
    const DB_NAME = process.env.DB_NAME || "ticketbox_db";
    const DB_USER = process.env.DB_USER;
    const DB_PASSWORD = process.env.DB_PASSWORD;

    // Tạo connection string với hoặc không có authentication
    let connectionString;
    if (DB_USER && DB_PASSWORD) {
      const encodedPassword = encodeURIComponent(DB_PASSWORD);
      const DB_AUTH_SOURCE = process.env.DB_AUTH_SOURCE || "admin";
      connectionString = `mongodb://${DB_USER}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH_SOURCE}`;
    } else {
      connectionString = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    }

    await mongoose.connect(connectionString);
    console.log("✅ Database connected successfully");
    console.log(`📊 Connected to: ${DB_NAME} at ${DB_HOST}:${DB_PORT}`);
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
}

module.exports = { connect };
