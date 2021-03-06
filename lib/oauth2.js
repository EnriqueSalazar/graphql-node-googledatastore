// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

const express = require('express')
const jwt = require('jsonwebtoken')
const config = require('../config/config').config // eslint-disable-line node/no-unpublished-require

// [START setup]
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

function extractProfile (profile) {
  let imageUrl = ''
  if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value
  }
  return {
    id: profile.id,
    displayName: profile.displayName,
    image: imageUrl
  }
}

// Configure the Google strategy for use by Passport.js.
//
// OAuth 2-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's behalf,
// along with the user's profile. The function must invoke `cb` with a user
// object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new GoogleStrategy({
  clientID: config.get('OAUTH2_CLIENT_ID'),
  clientSecret: config.get('OAUTH2_CLIENT_SECRET'),
  callbackURL: config.get('OAUTH2_CALLBACK'),
  accessType: 'offline'
}, (accessToken, refreshToken, profile, cb) => {
  // Extract the minimal profile information we need from the profile object
  // provided by Google
  cb(null, extractProfile(profile))
}))

passport.serializeUser((user, cb) => {
  cb(null, user)
})
passport.deserializeUser((obj, cb) => {
  cb(null, obj)
})
// [END setup]

const router = express.Router()

// Begins the authorization flow. The user will be redirected to Google where
// they can authorize the application to have access to their basic profile
// information. Upon approval the user is redirected to `/auth/google/callback`.
// If the `return` query parameter is specified when sending a user to this URL
// then they will be redirected to that URL when the flow is finished.
// [START authorize]
router.get(
  // Login url
  '/auth/login',
  // Start OAuth 2 flow using Passport.js
  passport.authenticate('google', { scope: ['email', 'profile'] })
)
// [END authorize]

// [START callback]
router.get(
  // OAuth 2 callback url. Use this url to configure your OAuth client in the
  // Google Developers console
  '/auth/google/callback',

  // Finish OAuth 2 flow using Passport.js
  passport.authenticate('google'),

  // Redirect back to the root page, adds cookie with profile data and token
  (req, res) => {
    const sessionPayloadJSON = {}
    // console.dir(req.user)
    console.dir(req.originalUrl)
    console.dir(req.path)
    console.dir(req.hostname)
    sessionPayloadJSON.profile = req.user
    sessionPayloadJSON.login = `/auth/login?return=${encodeURIComponent(req.originalUrl)}`
    sessionPayloadJSON.logout = `/auth/logout?return=${encodeURIComponent(req.originalUrl)}`
    sessionPayloadJSON.token = jwt.sign(sessionPayloadJSON.profile, config.get('SECRET'))
    const sessionPayloadString = JSON.stringify(sessionPayloadJSON)
    const opt = {maxAge: config.get('COOKIE_MAX_AGE_IN_HOURS') * 3600000}
    if (process.env.NODE_ENV === 'production') {
      opt.domain = config.get('FRONTEND_ROOT')
    }
    res.cookie(config.get('COOKIE_NAME'), sessionPayloadString, opt)
    const redirectTo = process.env.NODE_ENV === 'production' ? config.get('FRONTEND_ROOT') : 'http://' + req.hostname + ':8080'
    console.log('login',process.env.NODE_ENV, redirectTo)//eslint-disable-line
    res.redirect(redirectTo)
  }
)
// [END callback]

// Deletes the user's credentials and profile from the session.
// This does not revoke any active tokens.
router.get('/auth/logout', (req, res) => {
  req.logout()
  const opt = {maxAge: 1} // deletes the cookie immediately
  res.cookie(config.get('COOKIE_NAME'), '', opt)
  const redirectTo = process.env.NODE_ENV === 'production' ? config.get('FRONTEND_ROOT') : 'http://' + req.hostname + ':8080'
  console.log('logout',process.env.NODE_ENV, redirectTo)//eslint-disable-line
  res.redirect(redirectTo)
})

module.exports = {
  extractProfile: extractProfile,
  router: router
}
