'use strict';

const express = require('express');

const app = express();

var graphql = require('graphql').graphql

const graphqlExpress = require('graphql-server-express').graphqlExpress;
const graphiqlExpress = require('graphql-server-express').graphiqlExpress;

const bodyParser = require('body-parser');

const schema = require('./schema').schema;

// http://localhost:8080/graphql?query={__schema{types{name}}}
// http://localhost:8080/graphql?query={quizEntries{firstName,lastName}}
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));

// http://localhost:8080/graphiql?query={__schema{types{name}}}
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));

if (module === require.main) {
  // [START server] Start the server
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server
      .address()
      .port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
