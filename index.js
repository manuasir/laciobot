const Bot = require('./lib/telegram/bot')
const Storage = require('./lib/storage/storage')
const GeneralFeature = require('./lib/general/general')
const storageRepository = new Storage(process.env.dburl)
const bot = new Bot(process.env.token, storageRepository)
new GeneralFeature(bot.getBot())
// Start bot

bot.start()