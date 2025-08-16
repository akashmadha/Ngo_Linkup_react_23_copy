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

// For Railway deployment, allow localhost if explicitly set
const isRailwayDeployment = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT;

if (!process.env.DB_HOST) {
  console.error("❌ CRITICAL: DB_HOST environment variable is not set!");
  if (isRailwayDeployment) {
    console.error("This appears to be a Railway deployment. Please check your Railway environment variables.");
  }
  process.exit(1);
}

// Validate required environment variables
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error("❌ Missing required database environment variables!");
  console.error("Required: DB_USER, DB_PASSWORD, DB_NAME");
  console.error("Current values:");
  console.error("DB_HOST:", process.env.DB_HOST);
  console.error("DB_USER:", process.env.DB_USER);
  console.error("DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "***MISSING***");
  console.error("DB_NAME:", process.env.DB_NAME);
  process.exit(1);
}

console.log("🔍 Database Connection Details:");
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT || "3306 (default)");
console.log("User:", process.env.DB_USER);
console.log("Database:", process.env.DB_NAME);
console.log("Password:", process.env.DB_PASSWORD ? "***SET***" : "***MISSING***");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_CA_CERT ? {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
    ca: process.env.DB_CA_CERT
  } : false,
  connectionLimit: 10,
  connectTimeout: 60000, // Increased timeout for deployment environments
  acquireTimeout: 60000,
  timeout: 60000,
  // Add retry logic for connection failures
  acquireTimeout: 60000,
  waitForConnections: true,
  queueLimit: 0
});

console.log("🔍 Debug - Connection Pool Created");

// Test database connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
    console.error("Error code:", err.code);
    console.error("Error errno:", err.errno);
    
    if (err.code === 'ECONNREFUSED') {
      console.error("💡 Connection refused. This usually means:");
      console.error("   - Database service is not running");
      console.error("   - Wrong host/port combination");
      console.error("   - Firewall blocking the connection");
      console.error("   - Database server is down");
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("💡 Access denied. Check your username and password.");
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error("💡 Database does not exist. Check your DB_NAME.");
    }
    
    // Don't exit immediately, let the application try to recover
    console.log("🔄 Will retry connection in keep-alive loop...");
  } else {
    console.log("✅ Database connection successful!");
    connection.release();
  }
});

// Keep connections alive to avoid idle timeout
setInterval(() => {
  pool.query("SELECT 1", (err) => {
    if (err) {
      console.error("⚠️ Keep-alive query failed:", err.message);
      console.error("Error code:", err.code);
      
      // If it's a connection error, try to reconnect
      if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log("🔄 Connection lost, attempting to reconnect...");
      }
    } else {
      console.log("✅ Keep-alive query OK");
    }
  });
}, 10000); // Increased interval to 10 seconds

module.exports = pool;
