// test-clever-cloud.js
require("dotenv").config();
const mysql = require("mysql");

console.log("🧪 Testing Clever Cloud Database Connection...");
console.log("==============================================");

// Test connection
const connection = mysql.createConnection({
  host: "bin834rwp3kxnmdsbemg-mysql.services.clever-cloud.com",
  port: 3306,
  user: "u0q6z22lkem0ukiq",
  password: "hDKmGBjiczguH9rDIUmb",
  database: "bin834rwp3kxnmdsbemg"
});

console.log("🔌 Attempting to connect...");

connection.connect((err) => {
  if (err) {
    console.error("❌ Connection failed:", err.message);
    console.error("Error code:", err.code);
    console.error("Error errno:", err.errno);
  } else {
    console.log("✅ Connected to Clever Cloud MySQL!");
    
    // Test a simple query
    connection.query('SELECT 1 as test', (err, results) => {
      if (err) {
        console.error("❌ Query failed:", err.message);
      } else {
        console.log("✅ Query successful:", results);
      }
      connection.end();
    });
  }
});
