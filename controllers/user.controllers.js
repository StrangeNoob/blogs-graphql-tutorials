const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.models");

exports.createUser = async (parent, args) => {
  const { username, password } = args;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    return user;
  } catch (err) {
    throw new Error("Internal server error");
  }
};

exports.login = async (parent, args) => {
  const { username, password } = args;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("Invalid username or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Invalid username or password");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    return token;
  } catch (err) {
    throw new Error("Internal server error");
  }
};
