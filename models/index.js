const { Sequelize, DataTypes } = require("sequelize");
const dbConfig = require("../config/dbConfig");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  // operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

//------------checking connection--------------------
sequelize
  .authenticate()
  .then(() => {
    console.log("connected to database successfully");
  })
  .catch((err) => {
    console.log(err);
  });

//-- storing sequelize and Sequelize instances in db --

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
//-----------------------------------------------------

db.users = require("./userModel.js")(sequelize, DataTypes);
// db.profiles = require("./profileModel.js")(sequelize, DataTypes);
db.posts = require("./postModel.js")(sequelize, DataTypes);
// db.comments = require("./commentModel.js")(sequelize, DataTypes);
// db.categories = require("./categoryModel.js")(sequelize, DataTypes);
// db.tags = require("./tagModel.js")(sequelize, DataTypes);
// db.postTags = require("./postTagModel.js")(sequelize, DataTypes);

//
// db.sequelize.sync({ force: false }): This is the method call to synchronize the models with the database. db is an object containing the Sequelize instance with the defined models. The sync() method creates database tables if they don't exist. The force: false option is passed as an argument, which means that Sequelize will not drop the existing tables and recreate them (unless necessary due to model changes). If you set force: true, Sequelize would drop all tables and recreate them, effectively clearing the existing data.
db.sequelize.sync({ force: false }).then(() => {
  console.log("Drop and re-sync db.");
});

// //--------------------------------------------------------
// //---------ONE to ONE------------------------------------

// //one to one relationship between User(one) and Profile(one)
// db.users.hasOne(db.profiles, { foreignKey: "userId", as: "profile" });

// db.profiles.belongsTo(db.users, { foreignKey: "userId", as: "user" });

//--------------------------------------------------------
//--------ONE to MANY--------------
//one to many relationship between User(one) and Posts(many)
db.users.hasMany(db.posts, { foreignKey: "userId", as: "posts" });

db.posts.belongsTo(db.users, { foreignKey: "userId", as: "user" });

// //--------------------------------------------------------
// //--------------------------------------------------------

// //one to many relationship between User(one) and Commnets(many)
// db.users.hasMany(db.comments, { foreignKey: "userId", as: "comments" });

// db.comments.belongsTo(db.users, { foreignKey: "userId", as: "user" });

// //--------------------------------------------------------
// //--------------------------------------------------------

// //one to many relationship between Post(one) and Comments(many)
// db.posts.hasMany(db.comments, { foreignKey: "postId", as: "comments" });

// db.comments.belongsTo(db.posts, { foreignKey: "postId", as: "post" });

// //one to many relationship between Category(one) and Posts(many)
// db.categories.hasMany(db.posts, { foreignKey: "categoryId", as: "posts" });

// db.posts.belongsTo(db.categories, { foreignKey: "categoryId", as: "category" });

// // //--------MANY to MANY--------------

// db.tags.belongsToMany(db.posts, { through: "PostTags" }); //if you named your table PostTag then give as "PostTags" here

// db.posts.belongsToMany(db.tags, { through: "PostTags" });

module.exports = db;
