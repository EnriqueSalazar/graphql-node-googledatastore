'use strict';

const express = require('express');
const winston = require( 'winston');
const expressWinston = require( 'express-winston');
const cors = require('cors');
const app = express();

// Log the whole request and response body
expressWinston.requestWhitelist.push('body')
expressWinston.responseWhitelist.push('body')

// Logger makes sense before the router
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}))

//to enable CORS for local testing
app.use(cors());

var graphql = require('graphql').graphql

const graphqlExpress = require('graphql-server-express').graphqlExpress;
const graphiqlExpress = require('graphql-server-express').graphiqlExpress;

const bodyParser = require('body-parser');

const schema = require('./schema').schema;

// http://localhost:3000/graphql?query={__schema{types{name}}}
// http://localhost:3000/graphql?query={quizEntries{firstName,lastName}}
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));

// http://localhost:3000/graphiql?query={__schema{types{name}}}
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));

// Error logger makes sense after the router
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}))

if (module === require.main) {
  // [START server] Start the server
  const server = app.listen(process.env.PORT || 3000, () => {
    const port = server
      .address()
      .port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
