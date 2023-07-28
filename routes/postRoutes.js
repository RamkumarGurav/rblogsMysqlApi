const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

// GET ALL blogs

router
  .route("/posts")
  .get(postController.getAllPosts)
  .post(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    postController.createPost
  );

router
  .route("/posts/mine")
  .get(authController.isRouteProtected, postController.getAllMyPosts);
  

// UPDATE AND DELETE post
router
  .route("/posts/:id")
  .get(postController.getSinglePostWithAllDetails)
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    postController.updatePost
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    postController.deletePost
  );

router
  .route("/admin/posts/:id")
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    postController.updatePostByAdmin
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    postController.deletePostByAdmin
  );

module.exports = router;
