const TelegramBot = require('telebot');
const mongoose   = require('mongoose');
const http          = require('http');
const _          = require('lodash');

// MongoDB connection
mongoose.connect('mongodb://manuasir:Mlab51617-@ds147964.mlab.com:47964/laciobot',{useMongoClient:true});

// mongoose.connect('mongodb://localhost/dev-laciobot');
mongoose.Promise = global.Promise;

mongoose.connection.on('error',function(err){
  console.error("el err",err)
});

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