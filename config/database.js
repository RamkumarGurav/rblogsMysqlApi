// const { createPool } = require("mysql2");

// const pool = createPool({
//   port: 3306,
//   host: "sql6.freesqldatabase.com",
//   user: "sql6634972",
//   password: "eysVewZ5PY",
//   database: "sql6634972",
//   connectionLimit: 10,
// });

// module.exports = pool;

//------------WITHOUT POOL--------------------------------------------
//
// // Create a connection
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'your_username',
//   password: 'your_password',
//   database: 'your_database'
// });

// // Connect to the MySQL database
// connection.connect((error) => {
//   if (error) {
//     console.error('Error connecting to MySQL database:', error);
//     return;
//   }
//   console.log('Connected to MySQL database');
// });

// // Close the connection when done
// connection.end();
