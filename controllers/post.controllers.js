const { GraphQLError } = require("graphql");
const Post = require("../models/post.models");
const { ObjectId } = require("mongodb");

exports.getPosts = async (parent, args) => {
  try {
    const { page, limit } = args;

    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;

    const posts = await Post.aggregate([
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
      {
        $lookup: {
          from: "comments",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$post", "$$postId"],
                },
              },
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
          ],
          as: "comments",
        },
      },
    ]);

    return {
      posts,
      currentPage,
      totalPages,
      totalPosts,
    };
  } catch (err) {
    console.log(err);
    if (typeof err === Error) {
      throw new GraphQLError(err, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "createUser",
      });
    } else {
      throw err;
    }
  }
};

exports.getPostById = async (parent, args) => {
  const { _id } = args;

  try {
    const [post] = await Post.aggregate([
      {
        $match: {
          _id: new ObjectId(_id),
        },
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
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },
    ]);
    return post;
  } catch (err) {
    console.log(err);
    if (typeof err === Error) {
      throw new GraphQLError(err, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "createUser",
      });
    } else {
      throw err;
    }
  }
};

exports.createPost = async (parent, args, { userId }) => {
  const { title, content } = args;
  console.log({
    title,
    content,
    userId,
  });

  try {
    if (!userId) {
      throw new GraphQLError("Not authorized to create this post", {
        extensions: {
          code: "UNAUTHORIZED",
        },
        path: "createPost",
      });
    }

    const post = await Post.create({ title, content, author: userId });
    const [populatedPost] = await Post.aggregate([
      {
        $match: {
          _id: post._id,
        },
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
    console.log(populatedPost);
    return populatedPost;
  } catch (err) {
    if (typeof err === Error) {
      throw new GraphQLError(err, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "createUser",
      });
    } else {
      throw err;
    }
  }
};

exports.updatePost = async (parent, args, { userId }) => {
  const { _id, title, content } = args;

  try {
    const post = await Post.findById(_id);
    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: {
          code: "NOT_FOUND",
        },
        path: "deletePost",
      });
    }

    if (post.author.toString() !== userId) {
      throw new GraphQLError("Post not found", {
        extensions: {
          code: "NOT_FOUND",
        },
        path: "deletePost",
      });
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    await post.save();

    const [populatedPost] = await Post.aggregate([
      {
        $match: {
          _id: post._id,
        },
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
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },
    ]);
    return populatedPost;
  } catch (err) {
    if (typeof err === Error) {
      throw new GraphQLError(err, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "createUser",
      });
    } else {
      throw err;
    }
  }
};

exports.deletePost = async (parent, args, { userId }) => {
  const { id } = args;

  try {
    const post = await Post.findById(id);
    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: {
          code: "NOT_FOUND",
        },
        path: "deletePost",
      });
    }

    if (post.author.toString() !== userId) {
      throw new GraphQLError("Not authorized to delete this post", {
        extensions: {
          code: "UNAUTHORIZED",
        },
        path: "deletePost",
      });
    }

    await post.remove();
    return true;
  } catch (err) {
    if (typeof err === Error) {
      throw new GraphQLError(err, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "createUser",
      });
    } else {
      throw err;
    }
  }
};
