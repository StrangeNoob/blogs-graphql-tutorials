const { GraphQLError } = require("graphql");
const Comment = require("../models/comment.models");
const Post = require("../models/post.models");

exports.createComment = async (parent, args, { userId }) => {
  try {
    const { postId, content } = args;
    const post = await Post.findById(postId);
    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: {
          code: "NOT_FOUND",
        },
        path: "createComment",
      });
    }

    const comment = new Comment({ content, post: postId, author: userId });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    return comment;
  } catch (err) {
    if (typeof err === Error) {
      throw new GraphQLError(err, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "getComments",
      });
    } else {
      throw err;
    }
  }
};

exports.getComments = async (parent, args) => {
  try {
    const { _id } = parent;
    const { page, limit } = args;

    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;
    const totalComments = await Comment.countDocuments({ post: _id });
    const totalPages = Math.ceil(totalComments / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;

    const comments = await Comment.aggregate([
      {
        $match: {
          post: _id,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: itemsPerPage,
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
    ]);

    console.log("comments", comments);
    return {
      comments,
      currentPage,
      totalPages,
      totalComments,
    };
  } catch (err) {
    if (typeof err === Error) {
      throw new GraphQLError(err, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "getComments",
      });
    } else {
      throw err;
    }
  }
};

exports.getCommentsByPostId = async (parent, args) => {
  const { postId, page, limit } = args;

  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;

  try {
    const totalComments = await Comment.countDocuments({ post: postId });
    const totalPages = Math.ceil(totalComments / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;

    const comments = await Comment.aggregate([
      {
        $match: {
          post: postId,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: itemsPerPage,
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
    ]);

    console.log(comments);
    return {
      comments,
      currentPage,
      totalPages,
      totalComments,
    };
  } catch (err) {
    console.log(err);
    if (typeof err === Error) {
      throw new GraphQLError(err, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "getCommentsByPostId",
      });
    } else {
      throw err;
    }
  }
};
