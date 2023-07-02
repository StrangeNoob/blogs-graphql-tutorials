const userController = require("../controllers/user.controllers");
const postController = require("../controllers/post.controllers");
const commentController = require("../controllers/comment.controllers");

// Define the resolvers
const resolvers = {
  Query: {
    posts: postController.getPosts,
    post: postController.getPostById,
    comments: commentController.getCommentsByPostId,
    login: userController.login,
  },
  Mutation: {
    createUser: userController.createUser,
    createPost: postController.createPost,
    updatePost: postController.updatePost,
    deletePost: postController.deletePost,
    createComment: commentController.createComment,
  },
};

module.exports = resolvers;
