const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const { Op } = require("sequelize");
const Validator = require("fastest-validator");
// const cloudinary = require("cloudinary");

const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const Email = require("../utils/Email");

const db = require("../models");
const User = db.users;

//--------------------------------------------------------

// Creating JWT token
//--------------------------------------------------------
//--------------------------------------------------------
const signToken = (user) => {
  return jwt.sign({ user: user }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
//--------------------------------------------------------
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  user.passwordChangedAt = undefined;
  user.encryptedPasswordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.active = undefined;

  res.status(statusCode).json({ status: "success", token, data: { user } });
};
//--------------------------------------------------------
//--------------------------------------------------------

const encryptPass = async (password) => {
  // const salt = bcryptjs.genSaltSync(12);
  return await bcryptjs.hash(password, 12);
};

//--------------------------------------------------------
const isPasswordCorrect = async (givenPass, storedPass) => {
  return await bcryptjs.compare(givenPass, storedPass);
};

//--------------------------------------------------------
//--------------------------------------------------------

//-----------------------------------------------------------------
const isPasswordChangedAfterJwtIssued = function (
  JWTTimestamp,
  passwordChangedAt
) {
  if (passwordChangedAt) {
    const passwordChangedAtInSec = parseInt(
      new Date(passwordChangedAt).getTime() / 1000,
      10
    ); //converting date string into integer seconds ,bcz JWTTimestamp is always in seconds--parseInt(value,baseValue)
    // console.log(passwordChangedAtInSec, JWTTimestamp);
    //if date value is bigger then it means it is more recent date
    //here true means password is changed ,false meeans not changed
    return JWTTimestamp < passwordChangedAtInSec; //here if the passwordChangedAtInSec is bigger than  JWTTimestamp-means passwordChangedAtInSec is more recent date than JWTTimestamp -which means password is changed but token is still old one (no token generated for new password) so we need to login again//if the passwordChangedAtInSec is smaller than  JWTTimestamp-means passwordChangedAtInSec is more older date than JWTTimestamp -which means no new password is changed or created
  }
  //by default we return false
  //Here false means password is not changed after jwt is created
  return false;
};
//-----------------------------------------------------------------

//-----------------------------------------------------------------

const createResetToken = function () {
  //plain reset token
  const resetToken = crypto.randomBytes(32).toString("hex"); //creating 32 characters long random token//key-crpto crt
  //encrypted reset token

  // this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; //adding 10mins exporation time when resetToken is created//then resetToken is valid for 10mins

  return resetToken; //we use this in forgotpassword middleware
};
//--------------------------------------------------------
const createEncryptedResetToken = function (resetToken) {
  //plain reset token
  return crypto.createHash("sha256").update(resetToken).digest("hex"); //key-crpto ccud
};
//--------------------------------------------------------
//-------------------REGISTER-------------------------------------
//----
exports.register = catchAsyncErrors(async (req, res, next) => {
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new Error("Validation error:Passwords must match", 400));
  }
  req.body.password = await encryptPass(req.body.password);

  const userInfo = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    avatar: req.body.avatar,
  };

  // //------------custom validator---------
  // //first create schema
  // const schema = {
  //   role: {
  //     type: "enum",
  //     optional: false,
  //     values: ["admin", "user", "customer"],
  //     default: "customer",
  //   },
  //   avatar: {
  //     type: "string",
  //     optional: false,
  //     default: "/defaultAvatar.jpg",
  //   },
  //   active: {
  //     type: "boolean",
  //     optional: false,
  //     default: true,
  //   },
  // };

  // //create instance of validator ,it has validate method that give error if validation fails
  // const v = new Validator();
  // const validationResponse = v.validate(userInfo, schema); //if there is no errors in validation then validationResponse is true ,if there are any validtion errors then it gives the array of error objects

  // if (validationResponse !== true) {
  //   return next(
  //     new AppError(validationResponse.map((err) => err.message).join("."), 400)
  //   );
  //   // return res.status(400).json({
  //   //   status: "failed",
  //   //   message: "validation failed",
  //   //   errors: validationResponse
  //   // });
  // }
  //--------------------------------------------------------
  let user = await User.create(userInfo);

  user.password = undefined;
  user.passwordConfirm = undefined;

  if (!user) {
    return next(new AppError(`Error while creating a User`, 500));
  }

  // user = await User.findByfk(user);

  createSendToken(user, 201, req, res);
});

//--------------------------------------------------------

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Pleases provide email and password!", 400)); //400-bad request
  }

  let user = await User.findOne({
    where: { email: email },
  });

  if (!user) {
    return next(new AppError(`Invalid email or password`, 401));
  }

  // let isPasswordCorrect = await bcryptjs.compare(password, user.password);

  if (!(await isPasswordCorrect(password, user.password))) {
    return next(new AppError(`Invalid email or password`, 401));
  }

  // user = await User.findByfk(user);

  createSendToken(user, 200, req, res);
});
//--------------------------------------------------------

//------------------------PROTECTING ROUTE------------------
//middleware for checking whether given route is protected or not ,if it is protected then control moves to next middleware else it gives an error which is handled by global error handler
//here we check whether route is protected by verifying the jwt token that is provided to user(which is passed in the headers of the request) is same as the jwt token issued to to the user when he is logged ie
exports.isRouteProtected = catchAsyncErrors(async (req, res, next) => {
  //IMPstep1)checking the token exits and getting it
  //Checking whether there is a token in the req.headers authorization fields which starts with 'Bearer' word //then get that token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; //jwt token that is sent in headers authorization field
  } else if (req.cookies.jwt) {
    //if there is jwt in cookie
    token = req.cookies.jwt;
  }

  if (!token) {
    //if there is no token in the req,  means user is not logged in and error is generated
    return next(
      new AppError("You are not logged in! Please login to get access", 401)
    );
  }

  //IMPstep2)verifing the given token
  //in this -given jwt token is compared with the token that is issued to the loggedin user(original jwt token that is given to the user) -if user is different other than logged in user- it means it contains different payload(ie-different id) then it gives error
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //this gives the object that contains id of the user(payload) ,iat:timestamp in seconds when origianl jwt is created and jwt tokens expiration time ,Eg-{ id: '63e062a014de4fc239c6c5ec', iat: 1675649697, exp: 1683425697 }//if there this verification fails then it is catched/handled globalerror handler

  //IMPstep3)check if the user that is mentioned in given jwt token still exists
  // const currentUser = decoded.user;
  let decodedToken;
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      console.error("JWT verification failed:", error.message);
    } else {
      decodedToken = decoded;
      // console.log("JWT verified:", decoded);
    }
  });
  const currentUser = decodedToken.user;
  console.log(decodedToken);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  // //IMPstep4)check if user changed password after the token was issued
  if (
    currentUser.passwordChangedAt &&
    isPasswordChangedAfterJwtIssued(
      decodedToken.iat,
      currentUser.passwordChangedAt
    )
  ) {
    return next(
      new AppError("User recently changed password! please login again", 401)
    );
  }

  //IMPstep5) grant access to protected route
  req.user = currentUser; //storing currentuser in req.user which may be used next middleware in future eg-it is used in restrictedTo middlware to get current user's role
  next(); //if route is protected then move to next middleware which getAllTours
});

//--------------------------------------------------------

//--------------LOGOUT------------------------------------
//whenever user hitts logut route of api we send him a cookie which as same name as 'jwt' which actually stores the jwt token but in this cookie we will store normal text(here-'random text') instead of jwt token when browser reloads and sends this normal text to server then server fails to verify it and login fails and it moves to homepage
exports.logout = (req, res, next) => {
  //attaching cookie to response object
  //here we store normal text(here-'logout') inside the cookie named 'jwt'
  res.cookie("jwt", "random text", {
    expires: new Date(Date.now() + 1000), //1 seconds lifetime
    secure: false,
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out",
  });
};
//--------------------------------------------------------

//------------------------AUTHORIZATION--------------------
//
//middleware function that only allows 'admon' to use given route
exports.restrictTo = (...roles) => {
  //here we return middleware function inside the wrapper funciton because we cant pass arguements(roles) inside middleware funciton //here roles=['admin','user']//by doing this we can use roles inside middleware function
  return catchAsyncErrors(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //if the current user's role is not included in the  roles array then he is not allowed to move to next middleware-which means if the user is not 'admin' then dont allow the user  to move to next middleware
      return next(
        new AppError("You do not have permission to perform this action", 403) //403-forbidden
      );
    }
    next();
  });
};
//--------------------------------------------------------

// //--------FORGOT PASSWORD AND PASSWORD RESET-----------------
// //FORGOT PASSWORD AND PASSWORD RESET-when u provide your email adress application will send u an url link where u can update new password

// //FORGOT PASSWORD and sending email with password reset link
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  //step1)get user based on posted email
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }
  //step2)generate simple random token using builtin crypto module and save to user doc
  const resetToken = createResetToken(); //plain token

  const encryptedPasswordResetToken = createEncryptedResetToken(resetToken);
  const passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, passwordResetTokenExpires);

  const userUpdatedInfo = {
    encryptedPasswordResetToken: encryptedPasswordResetToken,
    passwordResetTokenExpires: passwordResetTokenExpires,
  };

  //updating future value columns (allowNull:true) by update method on already found user object
  const isUserUpdated = user.update(userUpdatedInfo);

  if (!isUserUpdated) {
    return next(new AppError(`Error while updating user `, 400));
  }
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your password reset token is :-\n\n${resetPasswordUrl}\n\nYour password reset token Valid for only 10 minutes\n\nIf you have not requested this email then Please ignore it`;

  //sending email to users email also handling error if sending fails
  try {
    await new Email(user, message).sendResetPasswordUrl();

    res.status(200).json({
      status: "success",
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (err) {
    //destroying token if there is error while sending email
    const updatedUserInfo = {
      encryptedPasswordResetToken: undefined,
      passwordResetTokenExpires: undefined,
    };

    user.update(updatedUserInfo);

    return next(
      new AppError(
        "There was an error while sending the email.Try agian later",
        500
      )
    );
  }

  return res.status(200).json({
    status: "success",
    message: `Email sent to ${req.body.email} successfully`,
  });
});
// //--------------------------------------------------------
// //RESET PASSWORD
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError("Passwords must match", 400));
  }
  console.log("resetToken", req.params.token);
  const encryptedToken = createEncryptedResetToken(req.params.token);
  console.log("encryptedToken", encryptedToken);
  let user = await User.findOne({
    where: {
      //searching user along with checking if the generated token is expired or not(if the passwordResetTokenExpires is greater than the present time in this situation then it means that it is not expired )
      encryptedPasswordResetToken: encryptedToken,
      passwordResetTokenExpires: { [Op.gt]: Date.now() },
    },
  });

  console.log(user);

  //step2)if token has not expired and there is user ,set the new password and clear the previous token
  if (!user) {
    return next(new AppError("Token is Invalid or has expired ", 400)); //400-badrequest
  }

  const password = await encryptPass(req.body.password);
  console.log("password", password);

  const updatedUserInfo = {
    password: password,
    encryptedPasswordResetToken: undefined,
    passwordResetTokenExpires: undefined,
  };

  let isUserUpdated = await User.update(updatedUserInfo, {
    where: { id: user.id },
  });

  if (!isUserUpdated) {
    return next(new AppError(`Error while changing user password`, 400));
  }

  //step3)Update the passwordChangedAt property for the current user
  //->done using document presave middlware

  //step4)Loggin the user by sending him the jwt token
  createSendToken(user, 200, req, res);
});
//--------------------------------------------------------

// //---------------UPDATE PASSWORD BY LOGGED IN USER-------------------

exports.changeMyPassword = catchAsyncErrors(async (req, res, next) => {
  console.log("body", req.body);
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError("Passwords must match", 400));
  }

  //step1)get user from the collection
  let user = await User.findOne({ where: { id: req.user.id } });

  //step2)check if posted current password is correct
  if (!(await isPasswordCorrect(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 400));
  }

  //step3)if so update password
  const encryptedPassword = await encryptPass(req.body.password);
  console.log("encryptedPassword", encryptedPassword);
  //updating password and passwordconfirm fields
  const isUserUpdated = await User.update(
    { password: encryptedPassword, passwordChangedAt: Date.now() },
    { where: { id: req.user.id } }
  );

  if (!isUserUpdated) {
    return next(new AppError(`Error while changing user password`, 400));
  }
  //step3)log user in ,send jwt token
  createSendToken(user, 200, req, res);
});
//--------------------------------------------------------
