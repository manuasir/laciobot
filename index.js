const Bot = require('./src/telegram/bot')
const Storage = require('./src/storage/storage')
const GeneralFeature = require('./src/general/general')
const storageRepository = new Storage(process.env.dburl)
const bot = new Bot(process.env.token, storageRepository)
new GeneralFeature(bot.getBot())
// Start bot

bot.start()