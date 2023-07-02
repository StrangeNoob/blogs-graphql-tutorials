require("dotenv").config();
const mongoose = require("mongoose");
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const typeDefs = require("./graphql/typedef");
const resolvers = require("./graphql/resolvers");
const authenticate = require("./middlewares/isAuth");

async function run() {
  // Connect to Local MongoDB
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
  });

  // Configure the GraphQL endpoint
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authenticate,
  });

  // Start the server
  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT || 3000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
