const resolvers = require("./resolvers");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const typeDefs = `
  type User {
    _id: ID!
    username: String!
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    _id: ID!
    content: String!
    post: Post!
    author: User!
  }

  type Comments {
    comments: [Comment!]!
    currentPage: String,
    totalPages: String,
    totalComments: String,
    
  }

  type Query {
    posts: [Post!]!
    post(_id: ID!): Post
    comments(postId: ID!, page: String, limit: String): Comments
  }

  type Mutation {
    createUser(username: String!, password: String!): User
    login(username: String!, password: String!): String
    createPost(title: String!, content: String!): Post
    updatePost(_id: ID!, title: String, content: String): Post
    deletePost(_id: ID!): Boolean
    createComment(postId: ID!, content: String!): Comment
  }
`;

// Create the executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
