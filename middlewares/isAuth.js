const jwt = require("jsonwebtoken");
// Authentication middleware
function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      return { userId };
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  }
  return {
    userId: null,
  };
}

module.exports = authenticate;
