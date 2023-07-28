const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

//-----------connecting to mysql database without sequelize----------
// pool.getConnection((error, connection) => {
//   if (error) {
//     return console.error("Error acquiring Database connection", error.message);
//   }
//   console.log("Successfully connected to Database"); // Release the connection back to the pool
//   // connection.release();
// });

// // Close the pool when done
// pool.end();
//--------------------------------------------------------

//---------------server ----------------------------
// console.log(process.env.NODE_ENV); //ouput=>development if npm run start:prod
const port = process.env.PORT || 8000; //while addin env variables to heroku dont add PORT bcz heroku generates its own port number
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
