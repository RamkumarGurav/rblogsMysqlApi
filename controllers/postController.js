const db = require("../models");
const AppError = require("../utils/AppError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const { Sequelize, Op } = require("sequelize");
const APIFeaturesForPostSequlize = require("../utils/APIFeaturesForPostSequlize");

const User = db.users;
const Post = db.posts;
// const Comment = db.comments;
// const Category = db.categories;
// const Tag = db.tags;
//--------------------------------------------------------
//--------------------------------------------------------
exports.createPost = catchAsyncErrors(async (req, res, next) => {
  const { title, subtitle, description, image, type, category } = req.body;

  postInfo = {
    title,
    subtitle,
    description,
    image,
    type,
    category,
    userId: req.user.id,
  };

  // const category = await Category.findByPk(categoryId);

  // if (!category) {
  //   return next(new AppError(`Please give a Valid categoryId `, 400));
  // }

  const post = await Post.create(postInfo);

  if (!post) {
    return next(new AppError(`Error while creating post`, 400));
  }

  return res.status(201).json({ status: "success", data: { post } });
});

//--------------------------------------------------------

// exports.addTagsToPost = catchAsyncErrors(async (req, res, next) => {
//   const postId = req.params.id;
//   const arrayOfTags = req.body.tags;
//   console.log(arrayOfTags);

//   const post = await Post.findByPk(postId);
//   if (!post) {
//     return next(new AppError(`No post found with id:${postId}`, 404));
//   }
//   const newTags = arrayOfTags.map(async (tag, i) => {
//     return await Tag.findOrCreate({ where: { name: tag } });
//   });

//   // const tag1 = await Tag.findOrCreate({where:{name:arrayOfTags[0]}});
//   // const tag2 = await Tag.findOrCreate({where:{name:arrayOfTags[1]}});
//   // await post.addTag([tag1[0], tag2[0]]);

//   const addTagsArr = newTags.map((newTag, i) => {
//     return newTag[0];
//   });

//   await post.addTags([...addTagsArr]);
//   return res.status(200).json({
//     status: "success",
//     message: "successfully added tags to post with id:${postId}",
//   });
// });

//
//-------------Get All Posts--------------------------------
exports.getAllPosts = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = req.query.limit * 1 || 20; //for pagination
  const unFilteredPostsCount = await Post.count(); //total no. of posts without any queries

  let features = new APIFeaturesForPostSequlize(
    Post,
    req.query
  ).filter_Sort_LimitFields_Search();

  // const doc = await features.query.explain();//used for creating indexes
  // console.log("features.query", features.query);
  let posts = await features.query;
  let filteredPostsCount = posts.length; //total no. of posts after queries before pagination because we need to know how many total posts are found before dividing them into pages
  features = new APIFeaturesForPostSequlize(
    Post,
    req.query
  ).filter_Sort_LimitFields_Search_Paginate(resultsPerPage);

  // console.log("features.query", features.query);
  posts = await features.query;

  const results = posts.length;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",

    data: {
      results,
      unFilteredPostsCount,
      filteredPostsCount,
      currentPage: Number(req.query.page || 1),
      resultsPerPage: resultsPerPage,
      unfilteredNumberOfPages: Math.ceil(
        unFilteredPostsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages
      filteredNumberOfPagesQuery: Math.ceil(
        filteredPostsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages for query results
      posts,
    },
  });
});
//..

//--------------------------------------------------------

exports.getAllMyPosts = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const resultsPerPage = req.query.limit * 1 || 20; //for pagination
  const unFilteredPostsCount = await Post.count(); //total no. of posts without any queries

  let features = new APIFeaturesForPostSequlize(
    Post,
    req.query
  ).my_Filter_Sort_LimitFields_Search(userId);

  // const doc = await features.query.explain();//used for creating indexes
  // console.log("features.query", features.query);
  let posts = await features.query;
  let filteredPostsCount = posts.length; //total no. of posts after queries before pagination because we need to know how many total posts are found before dividing them into pages
  features = new APIFeaturesForPostSequlize(
    Post,
    req.query
  ).my_Filter_Sort_LimitFields_Search_Paginate(resultsPerPage, userId);

  // console.log("features.query", features.query);
  posts = await features.query;

  const results = posts.length;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",

    data: {
      results,
      unFilteredPostsCount,
      filteredPostsCount,
      currentPage: Number(req.query.page || 1),
      resultsPerPage: resultsPerPage,
      unfilteredNumberOfPages: Math.ceil(
        unFilteredPostsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages
      filteredNumberOfPagesQuery: Math.ceil(
        filteredPostsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages for query results
      posts,
    },
  });
});

//--------------------------------------------------------

exports.getSinglePost = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const post = await Post.findByPk(id);

  if (!post) {
    return next(new AppError(`NO post found with the id :${id}`, 404));
  }

  return res.status(200).json({ status: "success", data: { post } });
});

//--------------------------------------------------------
exports.getSinglePostWithAllDetails = catchAsyncErrors(
  async (req, res, next) => {
    const postId = req.params.id;

    const post = await Post.findOne({
      where: { id: postId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "avatar"],
        },
      ],
    });

    if (!post) {
      return next(new AppError(`NO Post found  with id :${postId}`, 404));
    }

    return res.status(200).json({ status: "success", data: { post } });
  }
);

//--------------------------------------------------------

exports.updatePost = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  let post = await Post.findOne({ where: { id: id, userId: userId } });

  if (!post) {
    return next(
      new AppError(
        `NO post with id :${id} found for user with userId:${userId}`,
        404
      )
    );
  }
  const { title, subtitle, description, image, type, category } = req.body;

  const updatedPostInfo = {
    title,
    subtitle,
    description,
    image,
    type,
    category,
  };

  post = await Post.update(updatedPostInfo, {
    where: { id: id, userId: userId },
  });

  if (!post) {
    return next(new AppError(`Error while updating post`, 400));
  }

  post = await Post.findOne({ where: { id: id } });

  return res.status(200).json({ status: "success", data: { post } });
});

//

//--------------------------------------------------------

exports.deletePost = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

  const post = await Post.findOne({ where: { id: id, userId: userId } });

  if (!post) {
    return next(
      new AppError(
        `NO post with id :${id} found for user with userId:${userId}`,
        404
      )
    );
  }
  const deletedPost = await Post.destroy({ where: { id: id, userId: userId } });

  if (!deletedPost) {
    return next(
      new AppError(`error while deleting post with the id :${id}`, 400)
    );
  }

  return res.status(204).json({
    status: "success",
    message: `successfully deleted post with id:${id}`,
  });
});
//--------------------------------------------------------

exports.updatePostByAdmin = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let post = await Post.findByPk(id);

  if (!post) {
    return next(new AppError(`NO post found with the id :${id}`, 404));
  }
  const { title, subtitle, description, image, type, category, userId } =
    req.body;

  const updatedPostInfo = {
    title,
    subtitle,
    description,
    image,
    type,
    category,
    userId,
  };

  post = await Post.update(updatedPostInfo, { where: { id: id } });

  if (!post) {
    return next(new AppError(`Error while updating post`, 400));
  }

  post = await Post.findOne({ where: { id: id } });

  return res.status(200).json({ status: "success", data: { post } });
});

//

//--------------------------------------------------------

exports.deletePostByAdmin = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const post = await Post.findOne({ where: { id: id } });

  if (!post) {
    return next(new AppError(`NO post found with the id :${id}`, 404));
  }
  const deletedPost = await Post.destroy({ where: { id: id } });

  if (!deletedPost) {
    return next(
      new AppError(`error while deleting post with the id :${id}`, 400)
    );
  }

  return res.status(204).json({
    status: "success",
    message: `successfully deleted post with id:${id}`,
  });
});
