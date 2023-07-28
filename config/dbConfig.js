module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "1JS15ec071@",
  DB: "blogdb",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 300000,
    idle: 100000,
  },
};

// module.exports = {
//   HOST: "sql6.freesqldatabase.com",
//   USER: "sql6635225",
//   PASSWORD: "J6Kcvhvylz",
//   DB: "sql6635225",
//   dialect: "mysql",
//   pool: {
//     max: 20,
//     min: 0,
//     acquire: 300000,
//     idle: 100000,
//   },
// };

// HOST: The hostname or IP address of the MySQL database server. In this case, it is set to "localhost", indicating that the MySQL server is running on the same machine as the Node.js application.

// USER: The username used to authenticate with the MySQL database server. In this case, it is set to "root".

// PASSWORD: The password used to authenticate with the MySQL database server. In this case, it is set to "1JS15ec071@".

// DB: The name of the MySQL database that the Node.js application will connect to. In this case, it is set to "blogdb".

// dialect: The type of the database to be used. In this case, it is set to "mysql" to indicate that the application will use MySQL as the database engine.

// pool: An object containing options for the connection pool. The connection pool allows the application to manage multiple database connections efficiently.

// max: The maximum number of connections in the pool. In this case, it is set to 5.
// min: The minimum number of connections in the pool. In this case, it is set to 0, meaning that connections will be closed if idle for a certain amount of time.
// acquire: The maximum time (in milliseconds) that the pool will try to get a connection before throwing an error. In this case, it is set to 300000 (5 minutes).
// idle: The maximum time (in milliseconds) that a connection can be idle before being released from the pool. In this case, it is set to 100000 (1 minute and 40 seconds).
