const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const { GraphQLSchema } = require('graphql');

const app = express();
const prisma = new PrismaClient();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB for customer database
mongoose.connect('mongodb+srv://ahmed:1234@api-gateway.cz5ofdq.mongodb.net/customerDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware to identify user type and set up the database connection
app.use((req, res, next) => {
    // Example logic to identify user type (to be customized)
    req.isCompany = req.headers['x-user-type'] === 'company';
    next();
});

// Initialize GraphQL server
const server = new ApolloServer({
    schema: GraphQLSchema, // Define your schema here
    context: ({ req }) => ({
        isCompany: req.isCompany,
        prisma,
    }),
});
server.start().then(() => {
    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () =>
        console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
    );
});
