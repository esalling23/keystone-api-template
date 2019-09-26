// require necessary NPM packages
const express = require('express')
const bodyParser = require('body-parser')
// const mongoose = requzire('mongoose')
const cors = require('cors')
const keystone = require('keystone')
const cookieParser = require('cookie-parser')
const multer = require('multer')

// require middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// define server and client ports
// used for cors and local port declaration
// const serverDevPort = 4741
const clientDevPort = 7165

// define secrete cookie
const cookieSecret = 'secretCookie'

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(cors({ origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}` }))
console.log(`cors allowed from: http://localhost:${clientDevPort}`)

// define port for API to run on
// const port = process.env.PORT || serverDevPort

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken)

// cookie parser middleware for KeystoneJS
app.use(cookieParser(cookieSecret))

// multer middleware for KeystoneJS
app.use(multer())

// add `bodyParser` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(bodyParser.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(bodyParser.urlencoded({ extended: true }))

// log each request as it comes in for debugging
app.use(requestLogger)

// KeystoneJS config
keystone.init({
  'name': 'GA SEI Material Inventory',
  'brand': 'GA Brand',
  'session': false,
  'updates': 'updates',
  'auth': true,
  'user model': 'User',
  'auto update': true,
  'mongo': db,
  'cookie secret': cookieSecret
})

// Make sure to import models before any routes or middleware that creates
// documents using the keystone lists
keystone.import('app/models')

keystone.set('cors allow origin', true)
keystone.set('cors allow methods', true)
keystone.set('cors allow headers', true)

// require configured passport authentication middleware
const auth = require('./lib/auth')(keystone)
// register passport authentication middleware
app.use(auth)

// require route files
const userRoutes = require('./app/routes/user_routes')(keystone)
const exampleRoutes = require('./app/routes/example_routes')(keystone)

// register route files
app.use(userRoutes)
app.use(exampleRoutes)

keystone.set('routes', app)
// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

// start keystone
keystone.start()

// needed for testing
module.exports = app
