const express = require('express')
// Connect the DB
require('./db/mongoose')

const routerUser = require('./routers/user')
const app = express()
app.use(express.json())

// Routers
app.use(routerUser)

module.exports = app
