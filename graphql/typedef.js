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
    comments: Comments
  }
  
  type Posts {
    posts: [Post!]!
    currentPage: String,
    totalPages: String,
    totalPosts: String,
  }

  type Comment {
    _id: ID!
    content: String!
    post: Post!
    author: User
  }

  type Comments {
    comments: [Comment!]!
    currentPage: String,
    totalPages: String,
    totalComments: String,
    
  }

  type Query {
    posts: Posts
    post(_id: ID!): Post
    comments(postId: ID!, page: String, limit: String): Comments
    login(username: String!, password: String!): String
  }

  type Mutation {
    createUser(username: String!, password: String!): User
    createPost(title: String!, content: String!): Post
    updatePost(_id: ID!, title: String, content: String): Post
    deletePost(_id: ID!): Boolean
    createComment(postId: ID!, content: String!): Comment
  }
`;

module.exports = typeDefs;
