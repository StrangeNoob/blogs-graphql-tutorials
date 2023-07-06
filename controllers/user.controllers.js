const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");
const User = require("../models/user.models");

exports.createUser = async (parent, args) => {
  const { username, password } = args;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new GraphQLError("Username already exists", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
        path: "createUser",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    return user;
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

exports.login = async (parent, args) => {
  const { username, password } = args;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new GraphQLError("Invalid username or password", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
        path: "login",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new GraphQLError("Invalid username or password", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
        path: "login",
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    return token;
  } catch (err) {
    if (typeof err === Error) {
      throw new GraphQLError(err.message, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
        path: "login",
      });
    } else {
      throw err;
    }
  }
};
