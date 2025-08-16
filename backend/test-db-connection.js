// test-db-connection.js
require("dotenv").config();
const mysql = require("mysql");

console.log("🧪 Testing Database Connection...");
console.log("==================================");

// Log environment variables
console.log("Environment Variables:");
console.log("DB_HOST:", process.env.DB_HOST || "NOT SET");
console.log("DB_PORT:", process.env.DB_PORT || "NOT SET (will use default 3306)");
console.log("DB_USER:", process.env.DB_USER || "NOT SET");
console.log("DB_NAME:", process.env.DB_NAME || "NOT SET");
console.log("DB_PASSWORD:", process.env.DB_PASSWORD !== undefined ? "***SET***" : "NOT SET");
console.log("NODE_ENV:", process.env.NODE_ENV || "NOT SET");
console.log("RAILWAY_STATIC_URL:", process.env.RAILWAY_STATIC_URL || "NOT SET");

console.log("\n==================================");

// Check if required variables are set (DB_PASSWORD can be empty for no password)
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error("❌ Missing required environment variables!");
  console.error("Please set: DB_HOST, DB_USER, DB_NAME");
  console.error("Note: DB_PASSWORD can be empty for no password");
  process.exit(1);
}

// Create connection configuration
const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 30000
};

// Only add password if it's actually set (not empty string)
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  connectionConfig.password = process.env.DB_PASSWORD;
  console.log("🔐 Using password authentication");
} else {
  console.log("🔓 No password authentication (empty password)");
}

// Only add SSL if CA cert is provided
if (process.env.DB_CA_CERT) {
  connectionConfig.ssl = {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
    ca: process.env.DB_CA_CERT
  };
}

console.log("🔌 Connection config:", {
  host: connectionConfig.host,
  port: connectionConfig.port,
  user: connectionConfig.user,
  database: connectionConfig.database,
  hasPassword: !!connectionConfig.password,
  hasSSL: !!connectionConfig.ssl
});

// Create connection
const connection = mysql.createConnection(connectionConfig);

console.log("🔌 Attempting to connect to database...");

// Test connection
connection.connect((err) => {
  if (err) {
    console.error("❌ Connection failed!");
    console.error("Error:", err.message);
    console.error("Code:", err.code);
    console.error("Errno:", err.errno);
    
    if (err.code === 'ECONNREFUSED') {
      console.error("\n💡 Connection refused. This usually means:");
      console.error("   - Database service is not running");
      console.error("   - Wrong host/port combination");
      console.error("   - Firewall blocking the connection");
      console.error("   - Database server is down");
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("\n💡 Access denied. This usually means:");
      console.error("   - Wrong username or password");
      console.error("   - User doesn't have access to this database");
      console.error("   - If using no password, make sure DB_PASSWORD= in .env");
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error("\n💡 Database does not exist. Check your DB_NAME.");
    } else if (err.code === 'ENOTFOUND') {
      console.error("\n💡 Host not found. Check your DB_HOST.");
    }
    
    process.exit(1);
  }
  
  console.log("✅ Database connection successful!");
  
  // Test a simple query
  connection.query('SELECT 1 as test', (err, results) => {
    if (err) {
      console.error("❌ Query test failed:", err.message);
    } else {
      console.log("✅ Query test successful:", results);
    }
    
    // Close connection
    connection.end((err) => {
      if (err) {
        console.error("❌ Error closing connection:", err.message);
      } else {
        console.log("✅ Connection closed successfully");
      }
      process.exit(0);
    });
  });
});
