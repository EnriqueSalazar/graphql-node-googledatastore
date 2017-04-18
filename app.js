'use strict'

const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const jwt = require('express-jwt')

const winston = require('winston')
const expressWinston = require('express-winston')
// const cors = require('cors');
const graphqlExpress = require('graphql-server-express').graphqlExpress
const graphiqlExpress = require('graphql-server-express').graphiqlExpress

const bodyParser = require('body-parser')

const passport = require('passport')
const oauth2 = require('./lib/oauth2')

const schema = require('./src/schema').schema
const config = require('./config/config').config // eslint-disable-line node/no-unpublished-require

const app = express()
app.use(cookieParser())

// Log the whole request and response body
// expressWinston.requestWhitelist.push('body')
// expressWinston.responseWhitelist.push('body')

// Logger makes sense before the router
// app.use(expressWinston.logger({
//   transports: [
//     new winston.transports.Console({
//       json: true,
//       colorize: true
//     })
//   ]
// }))

// Configure the session and session storage.
const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: config.get('SECRET'),
  signed: true
}

app.use(session(sessionConfig))

// OAuth2
app.use(passport.initialize())
app.use(passport.session())
app.use(oauth2.router)

app.use(jwt({secret: config.get('SECRET')}).unless({path: ['/auth/google/callback', '/auth/login', '/auth/logout', '/graphql/']}), (err, req, res, next) => {
  console.error('req.path :', req.path) // eslint-disable-line no-console
  if (err) {
    // console.error('err :', err) // eslint-disable-line no-console
    console.error('err.name :', err.name) // eslint-disable-line no-console
    console.error('err.message :', err.message) // eslint-disable-line no-console
    console.error('err.code :', err.code) // eslint-disable-line no-console
  } else {
    console.log(req.user) // eslint-disable-line no-console
  }
})

// to enable CORS for local testing
// app.use(cors());

// http://localhost:3000/graphql?query={__schema{types{name}}}
// http://localhost:3000/graphql?query={quizEntries{firstName,lastName}}
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))

// http://localhost:3000/graphiql?query={__schema{types{name}}}
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))

// Error logger makes sense after the router
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      prettyPrint: true,
      colorize: true
    })
  ]
}))

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
