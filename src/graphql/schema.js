const { gql } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
    },
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

module.exports = schema;
