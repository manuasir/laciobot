const Bot = require('./bot')
const bot = new Bot(process.env.TOKEN, process.env.NODE, process.env.dburl)
require('./app')(bot)
