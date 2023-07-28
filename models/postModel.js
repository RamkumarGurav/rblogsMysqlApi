module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 500],
          msg: "Title of the post must have atleast 3 characters",
        },
      },
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 500],
          msg: "subtitle of the post must have atleast 3 characters",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [3, 5000],
          msg: "description of the post must have atleast 3 characters",
        },
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "/defaultPostImageUrl.jpg",
      validate: {
        len: {
          args: [3, 5000],
          msg: "Title of the post must have atleast 3 characters",
        },
      },
    },
    type:{
      type:DataTypes.STRING,
      defaultValue:"latest",
      allowNull: false,
      validate: {
        len: {
          args: [3, 500],
          msg: "type of the post must have atleast 3 characters",
        },
      }
    },
    category: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 500],
          msg: "category of the post must have atleast 3 characters",
        },
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(), //current Date
      allowNull: false,
    },
  });

  return Post;
};
