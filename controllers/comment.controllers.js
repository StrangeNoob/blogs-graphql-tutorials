const Comment = require("../models/comment.models");
const Post = require("../models/post.models");

exports.createComment = async (parent, args, { userId }) => {
  try {
    const { postId, content } = args;
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const comment = new Comment({ content, post: postId, author: userId });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    return comment;
  } catch (err) {
    throw new Error("Internal server error");
  }
};

exports.getComments = async (parent) => {
  try {
    const comments = await Comment.find({
      post: parent.id,
    }).sort({ createdAt: -1 });
    return comments;
  } catch (err) {
    throw new Error("Internal server error");
  }
};

exports.getCommentsByPostId = async (parent, args) => {
  const { postId, page, limit } = args;

  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  console.log({
    postId,
    currentPage,
    itemsPerPage,
  });

  try {
    const totalComments = await Comment.countDocuments({ post: postId });
    const totalPages = Math.ceil(totalComments / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;

    const comments = await Comment.find({ post: postId })
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 })
      .populate("author")
      .populate("post");

    console.log(comments);
    return {
      comments,
      currentPage,
      totalPages,
      totalComments,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Internal server error");
  }
};
