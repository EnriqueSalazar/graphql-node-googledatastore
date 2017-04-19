'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('express-jwt')

const graphqlExpress = require('graphql-server-express').graphqlExpress
const graphiqlExpress = require('graphql-server-express').graphiqlExpress

const bodyParser = require('body-parser')

const passport = require('passport')
const oauth2 = require('./lib/oauth2')

const schema = require('./src/schema').schema
const config = require('./config/config').config // eslint-disable-line node/no-unpublished-require

const app = express()
app.use((req, res, next) => {
  console.error('req.path :', req.path) // eslint-disable-line no-console
  // console.error('req.user :', req.user) // eslint-disable-line no-console
  next()
})
app.use(cookieParser())

// OAuth2
app.use(passport.initialize())

// Extracts the token from the cookie, if valid, fills req.user with the decrypted content from the token.
// DOesnt check for the token for authentication paths
app.use(jwt({
  secret: config.get('SECRET'),
  getToken: (req) => {
    const cookie = JSON.parse(req.cookies[config.get('COOKIE_NAME')])
    const token = cookie.token
    return token
  }
}).unless({path: ['/auth/google/callback', '/auth/login', '/auth/logout']}), (err, req, res, next) => {
  if (err) {
    console.error('err.name :', err.name) // eslint-disable-line no-console
    console.error('err.message :', err.message) // eslint-disable-line no-console
    console.error('err.code :', err.code) // eslint-disable-line no-console
    res.redirect('/auth/login')
  }
})

// For development, logs the user after JWT decrypts the token
app.use((req, res, next) => {
  req.user && console.error('req.user :', req.user) // eslint-disable-line no-console
  next()
})
app.use(oauth2.router)

// http://localhost:3000/graphql?query={__schema{types{name}}}
// http://localhost:3000/graphql?query={quizEntries{firstName,lastName}}
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))

// http://localhost:3000/graphiql?query={__schema{types{name}}}
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))

if (module === require.main) {
  // [START server] Start the server
  const server = app.listen(process.env.PORT || 3000, () => {
    const port = server
      .address()
      .port
    console.log(`App listening on port ${port}`);//eslint-disable-line
  })
  // [END server]
}

module.exports = app
