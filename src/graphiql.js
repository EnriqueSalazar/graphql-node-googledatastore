const express = require('express');
const graphiqlExpress = require('graphql-server-express').graphiqlExpress;
const router = express.Router();

const oauth2 = require('../lib/oauth2');

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.use(oauth2.required);

// http://localhost:8080/graphiql?query={__schema{types{name}}}
router.use('/', graphiqlExpress({endpointURL: '/graphql'}));

module.exports = router;
