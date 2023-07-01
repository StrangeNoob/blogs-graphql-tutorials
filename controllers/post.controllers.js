const Post = require("../models/post.models");
const User = require("../models/user.models");
const { ObjectId } = require("mongodb");

exports.getPosts = async (parent, args) => {
  try {
    const posts = await Post.aggregate([
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
    return posts;
  } catch (err) {
    throw new Error("Internal server error");
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
    console.log(post);
    return post;
  } catch (err) {
    console.log(err);
    throw new Error("Internal server error");
  }
};

exports.createPost = async (parent, args, { userId }) => {
  const { title, content } = args;
  console.log({
    title,
    content,
    userId,
  });

  console.log(userId);

  try {
    if (!userId) {
      throw new Error("Not authorized to create this post");
    }

    const post = new Post({ title, content, author: userId });
    await post.save();
    const populatedPost = await post.populate("author");
    console.log(populatedPost);
    return populatedPost;
  } catch (err) {
    throw new Error("Internal server error");
  }
};

exports.updatePost = async (parent, args, { userId }) => {
  const { _id, title, content } = args;

  try {
    const post = await Post.findById(_id);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.author.toString() !== userId) {
      throw new Error("Not authorized to update this post");
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
    console.log(populatedPost);
    return populatedPost;
  } catch (err) {
    console.log(
      "🚀 ~ file: post.controllers.js ~ line 144 ~ updatePost ~ err",
      err
    );
    throw new Error("Internal server error");
  }
};

exports.deletePost = async (parent, args, { userId }) => {
  const { id } = args;

  try {
    const post = await Post.findById(id);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.author.toString() !== userId) {
      throw new Error("Not authorized to delete this post");
    }

    await post.remove();
    res.json({ success: true });
  } catch (err) {
    throw new Error("Internal server error");
  }
};
