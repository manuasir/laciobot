const TelegramBot = require('telebot');
const mongoose   = require('mongoose');
const http          = require('http');
const _          = require('lodash');

// MongoDB connection
mongoose.connect('mongodb://manuasir:mongodb@ds147072.mlab.com:47072/heroku_mctx4f0c',{useMongoClient:true});
//mongoose.connect('mongodb://localhost/dev-laciobot');
mongoose.Promise = global.Promise;

//This is because of Heroku issues
http.createServer(function (request, response) {}).listen(process.env.PORT || 5000);


setInterval(function() {
  http.get("http://laciobot.herokuapp.com");
}, 300000); // every 5 minutes (300000)

const token = process.env.TOKEN;

const bot = new TelegramBot({
  token:token,
  usePlugins: ['askUser','commandButton']
});

const init = require('./lib/index')(bot);

bot.start();