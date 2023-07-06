const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
// Authentication middleware
async function authenticate({ req }) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      return { userId };
    } catch (err) {
      throw new GraphQLError("Invalid or expired token", {
        extensions: { code: "UNAUTHENTICATED" },
        path: "authenticate",
      });
    }
  }
  return {
    userId: null,
  };
}

module.exports = authenticate;
