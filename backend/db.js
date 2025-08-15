// db.js
const mysql = require("mysql");
require("dotenv").config();

console.log("🔍 Debug - Environment Variables:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("NODE_ENV:", process.env.NODE_ENV);

console.log("🔍 Debug - Variable Check:");
console.log("DB_HOST is undefined:", process.env.DB_HOST === undefined);
console.log("DB_HOST is null:", process.env.DB_HOST === null);
console.log("DB_HOST length:", process.env.DB_HOST ? process.env.DB_HOST.length : "undefined");

// Force exit if environment variables are not loaded
if (!process.env.DB_HOST || process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1") {
  console.error("❌ CRITICAL: Environment variables not loaded properly!");
  console.error("DB_HOST is:", process.env.DB_HOST);
  console.error("This should be: gateway01.ap-southeast-1.prod.aws.tidbcloud.com");
  console.error("Railway environment variables are not being loaded!");
  process.exit(1);
}

// Validate required environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error("❌ Missing required database environment variables!");
  console.error("Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
  console.error("Current values:");
  console.error("DB_HOST:", process.env.DB_HOST);
  console.error("DB_USER:", process.env.DB_USER);
  console.error("DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "***MISSING***");
  console.error("DB_NAME:", process.env.DB_NAME);
  process.exit(1);
}

console.log("🔍 Database Connection Details:");
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("User:", process.env.DB_USER);
console.log("Database:", process.env.DB_NAME);
console.log("Password:", process.env.DB_PASSWORD ? "***SET***" : "***MISSING***");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  connectionLimit: 10, // max open connections
  connectTimeout: 10000 // 10s timeout for new connections
});

console.log("🔍 Debug - Connection Pool Created");

// Keep connections alive to avoid idle timeout
setInterval(() => {
  pool.query("SELECT 1", (err) => {
    if (err) {
      console.error("⚠️ Keep-alive query failed:", err);
    } else {
      console.log("✅ Keep-alive query OK");
    }
  });
}, 5000);

module.exports = pool;
