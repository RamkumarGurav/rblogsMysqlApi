module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: "First Name must be atleast of 3 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Invalid email format",
        },
      },
    },

    role: {
      type: DataTypes.ENUM("admin", "user", "customer"),
      allowNull: false,
      defaultValue: "user",
    },

    // mobileNumber: {
    //   type: DataTypes.STRING(10),
    //   allowNull: false,
    //   validate: {
    //     len: {
    //       args: [10, 10],
    //       msg: "Please give correct mobile Number",
    //     },
    //   },
    // },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "/defaultAvatar.jpg",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8],
          msg: "Password must be at least 8 characters long",
        },
      },
    },
    // passwordConfirm: {
    //   type: DataTypes.VIRTUAL, // Virtual field that won't be stored in the database
    //   allowNull: false,
    //   // validate: {
    //   //   isConfirmed(value) {
    //   //     if (value !== this.password) {
    //   //       throw new Error("Passwords do not match");
    //   //     }
    //   //   },
    //   // },
    // },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }, //  date when password is changed/updated
    encryptedPasswordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });

  return User;
};
