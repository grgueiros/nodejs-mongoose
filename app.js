require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const mongoose = require('mongoose')


const app = express();

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// middlewares
require('./helpers')(app)

// routes
fs.readdirSync('routes').forEach(route => {
  require('./routes/' + route)(app)
})

mongoose.connect(
  `mongodb://${process.env.DB_HOST}/${process.env.DB_DATABASE}`
)


app.listen(process.env.APP_PORT, () => { console.log(`App running on port ${process.env.APP_PORT}`) });