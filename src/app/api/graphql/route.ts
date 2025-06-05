import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";
import { NextRequest } from "next/server";

// Sample data
let users = [{ id: "1", name: "Батбаяр", role: "Инженер" }];

// GraphQL schema
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    role: String!
  }

  type Query {
    users: [User!]!
  }

  type Mutation {
    createUser(name: String!, role: String!): User!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
  },
  Mutation: {
    createUser: (_: any, { name, role }: { name: string; role: string }) => {
      const newUser = { id: Date.now().toString(), name, role };
      users.push(newUser);
      return newUser;
    },
  },
};

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create Next.js handler
const handler = startServerAndCreateNextHandler<NextRequest>(server);

// Export POST route
export const POST = handler;

// Optional GET route
export const GET = async () => {
  return new Response(
    JSON.stringify({
      message: "Apollo GraphQL API is live!",
      tryQuery: `query { users { id name role } }`,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
