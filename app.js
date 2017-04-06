'use strict';

const express = require('express');
const session = require('express-session');
const MemcachedStore = require('connect-memcached')(session);
const passport = require('passport');

const config = require('./config');

const app = express();
// Configure the session and session storage.
const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: config.get('SECRET'),
  signed: true
};

// In production use the App Engine Memcache instance to store session data,
// otherwise fallback to the default MemoryStore in development.
if (config.get('NODE_ENV') === 'production') {
  sessionConfig.store = new MemcachedStore({
    hosts: [config.get('MEMCACHE_URL')]
  });
}

app.use(session(sessionConfig));
// [END session]
//
// OAuth2
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./lib/oauth2').router);

app.use('/graphql', require('./src/graphql'));
app.use('/graphiql', require('./src/graphiql'));
app.use('/', require('./src/main'));

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
