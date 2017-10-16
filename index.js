const Bot = require('./bot')
const bot = new Bot(process.env.TOKEN, process.env.NODE, process.env.dburl)
// start server
require('./app')(bot)
