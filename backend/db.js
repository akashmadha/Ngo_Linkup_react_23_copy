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

const pool = mysql.createPool({
  host: process.env.DB_HOST || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER || "4Vqx4ZUVAZtzDyk.root",
  password: process.env.DB_PASSWORD || "aFb9wvjqeXt1C4m7",
  database: process.env.DB_NAME || "test",
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
