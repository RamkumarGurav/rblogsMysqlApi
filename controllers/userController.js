const db = require("../models");
const AppError = require("../utils/AppError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = db.users;
const Post = db.posts;
const Comment = db.comments;

exports.createUser = catchAsyncErrors(async (req, res, next) => {
  const salt = bcryptjs.genSaltSync(10);

  req.body.password = bcryptjs.hashSync(req.body.password, salt);
  req.body.passwordConfirm = bcryptjs.hashSync(req.body.passwordConfirm, salt);

  const { name, role, email, password, passwordConfirm, avatar } = req.body;

  userInfo = {
    name,
    email,
    password,
    passwordConfirm,
    role,
    avatar,
  };

  const user = await User.create(userInfo);
  user.password = undefined;
  user.passwordConfirm = undefined;

  if (!user) {
    return next(new AppError(`Error while creating user`, 400));
  }

  return res.status(201).json({ status: "success", data: { user } });
});

//--------------------------------------------------------

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.findAll({
    attributes: [
      "firstName",
      "lastName",
      "email",
      "avatar",
      "mobileNumber",
      "role",
      "id",
    ],
  });

  if (!users) {
    return next(new AppError(`No Users Found`, 404));
  }

  return res.status(200).json({ status: "success", data: { users } });
});
//--------------------------------------------------------
exports.getAllActiveUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.findAll({
    where: { active: true },
    attributes: ["name", "email", "avatar", "role", "id"],
  });

  if (!users) {
    return next(new AppError("Users not Found", 404));
  }

  res
    .status(200)
    .json({ status: "success", results: users.length, data: { users } });
});
//--------------------------------------------------------

exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findOne({
    where: { id: id },
    attributes: {
      exclude: [
        "password",
        "passwordConfirm",
        "passwordChangedAt",
        "encryptedPasswordResetToken",
        "passwordResetTokenExpires",
        "active",
      ],
    },
  });

  if (!user) {
    return next(new AppError(`NO user found with the id :${id}`, 404));
  }

  return res.status(200).json({ status: "success", data: { user } });
});

//--------------------------------------------------------
//--------------------------------------------------------
exports.getSingleUserWithDetails = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findOne({
    where: { id: id },
    include: [
      { model: Post, as: "posts" },
      { model: Comment, as: "comments" },
    ],
  });

  if (!user) {
    return next(new AppError("Post not Found", 404));
  }

  res.status(200).json({ status: "success", data: { user } });
});
//--------------------------------------------------------

exports.getMe = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.user);
  const id = req.user.id;

  const user = await User.findOne({
    where: { id: id },
    attributes: {
      exclude: [
        "password",
        "passwordConfirm",
        "passwordChangedAt",
        "encryptedPasswordResetToken",
        "passwordResetTokenExpires",
        "active",
      ],
    },
  });

  if (!user) {
    return next(new AppError(`NO user found with the id :${id}`, 404));
  }

  return res.status(200).json({ status: "success", data: { user } });
});

//--------------------------------------------------------

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  if (req.body.password | req.body.passwordConfirm) {
    return next(
      new AppError(`You are not allowed to perform this action`, 403)
    );
  }

  let user = await User.findOne({ where: { id: id } });

  if (!user) {
    return next(new AppError(`NO user found with the id :${id}`, 404));
  }
  const { name, email, avatar, role } = req.body;
  const updatedUserInfo = {
    name,
    email,
    avatar,
    role: "admin",
  };

  user = await User.update(updatedUserInfo, { where: { id: id } });

  if (!user) {
    return next(new AppError(`Error while updating user`, 400));
  }

  user = await User.findOne({ where: { id: id } });

  return res.status(200).json({ status: "success", data: { user } });
});

//

//--------------------------------------------------------

//--------------------------------------------------------

exports.updateMe = catchAsyncErrors(async (req, res, next) => {
  const id = req.user.id;
  if (req.body.password | req.body.passwordConfirm) {
    return next(
      new AppError(`You are not allowed to perform this action`, 403)
    );
  }

  let user = await User.findOne({ where: { id: id } });

  if (!user) {
    return next(new AppError(`NO user found with the id :${id}`, 404));
  }
  const { name, email, avatar } = req.body;
  const updatedUserInfo = {
    name,
    email,
    avatar,
  };

  user = await User.update(updatedUserInfo, { where: { id: id } });

  if (!user) {
    return next(new AppError(`Error while updating user`, 400));
  }

  user = await User.findByPk(id);

  return res.status(200).json({ status: "success", data: { user: user } });
});

//--------------------------------------------------------

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findOne({ where: { id: id } });

  if (!user) {
    return next(new AppError(`NO user found with the id :${id}`, 404));
  }
  const deletedUser = await User.destroy({ where: { id: id } });

  if (!deletedUser) {
    return next(
      new AppError(`error while deleting user with the id :${id}`, 404)
    );
  }

  return res.status(204).json({
    status: "success",
    message: `successfully deleted user with id:${id}`,
  });
});
