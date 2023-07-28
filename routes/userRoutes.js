const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.get(
  "/users",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  userController.getAllUsers
);

router.post("/users/register", authController.register);
router.post("/users/login", authController.login);

router.get(
  "/users/logout",
  authController.isRouteProtected,
  authController.logout
);

router.patch(
  "/users/updateMe",
  authController.isRouteProtected,
  userController.updateMe
);

router.get("/users/me", authController.isRouteProtected, userController.getMe);

router.get(
  "/users/:id",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  userController.getSingleUser
);

router.delete(
  "/users/:id",
  authController.isRouteProtected,
  userController.deleteUser
);

router.patch(
  "/users/update-my-password",
  authController.isRouteProtected,
  authController.changeMyPassword
);

router.post("/users/password/forgot", authController.forgotPassword);

router.patch("/users/password/reset/:token", authController.resetPassword);

// ------------ADMIN--------------------------------------------
router.get(
  "/users/with-details/:id",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  userController.getSingleUserWithDetails
);
router.patch(
  "/users/update-by-admin/:id",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  userController.updateUser
);
router.delete(
  "/users/delete-by-admin/:id",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  userController.deleteUser
);

module.exports = router;
