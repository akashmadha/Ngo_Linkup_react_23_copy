// db.js
const mysql = require("mysql");
require("dotenv").config();

let db;

function handleDisconnect() {
  // Debug: Log environment variables
  console.log("🔍 Debug - Environment Variables:");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("NODE_ENV:", process.env.NODE_ENV);

  const connectionConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000, // Add port configuration
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  console.log("🔍 Debug - Connection Config:", connectionConfig);

  db = mysql.createConnection(connectionConfig);

  db.connect((err) => {
    if (err) {
      console.log("❌ MySQL connection error:", err);
      setTimeout(handleDisconnect, 2000); // Try again after 2 seconds
    } else {
      console.log("✅ MySQL Connected");
    }
  });

  db.on('error', function(err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('⚠️  MySQL connection lost. Reconnecting...');
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = db;
