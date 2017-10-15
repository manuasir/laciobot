const TelegramBot = require('telebot')
const mongoose = require('mongoose')
const http = require('http')
const _ = require('lodash')

// MongoDB connection
const dbUrl = process.env.dburl
mongoose.connect(dbUrl, {useMongoClient: true})

// mongoose.connect('mongodb://localhost/dev-laciobot');
mongoose.Promise = global.Promise

mongoose.connection.on('error', function (err) {
  console.error('el err', err)
})

// This is because of Heroku can listen as webhook
http.createServer(function (request, response) {}).listen(process.env.PORT || 8081)

const token = process.env.TOKEN

const conf = process.env.NODE === 'production' ? {
  token: token,
  webhook: { // Optional. Use webhook instead of polling.
    url: 'https://laciobot.herokuapp.com', // HTTPS url to send updates to.
    host: '0.0.0.0', // Webhook server host.
    port: 443, // Server port.
    maxConnections: 40 // Optional. Maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery
  },
  usePlugins: ['askUser', 'commandButton']
} : {
  token: token,
  usePlugins: ['askUser', 'commandButton']
}

const bot = new TelegramBot(conf)

const init = require('./lib/index')(bot)

bot.start()
