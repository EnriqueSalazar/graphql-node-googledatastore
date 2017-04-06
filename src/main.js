const express = require('express');
const graphiqlExpress = require('graphql-server-express').graphiqlExpress;
const router = express.Router();

const oauth2 = require('../lib/oauth2');

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.use(oauth2.template);

router.use('/', (req, res) => {
    console.log('originalURL', req.originalUrl)
    if (typeof res.locals.profile === 'undefined') {
        res.send(`
            <a href='${res.locals.login}'>
                Login
            </a>
        `)
    } else {
        res.send(`
            <a href='${res.locals.logout}'>
                Logout
            </a>
            <br />
            <br />
            <a href='/graphiql'>
                GraphiQl
            </a>
        `)
    }

});

module.exports = router;
