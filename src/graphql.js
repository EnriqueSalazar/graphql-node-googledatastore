const express = require('express');
const graphqlExpress = require('graphql-server-express').graphqlExpress;
const bodyParser = require('body-parser');
const router = express.Router();

const schema = require('./schema').schema;
const oauth2 = require('../lib/oauth2');

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.use(oauth2.required);

// http://localhost:8080/graphql?query={__schema{types{name}}}
// http://localhost:8080/graphql?query={quizEntries{firstName,lastName}}
router.use('/', bodyParser.json(), graphqlExpress({schema}));

module.exports = router;