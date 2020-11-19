const Bot = require('./src/telegram/bot')
const Storage = require('./src/storage/storage')
const GeneralFeature = require('./src/general/general')
const Trivia = require('./src/trivia/trivia')

const storageRepository = new Storage(process.env.dburl)
const bot = new Bot(process.env.token, storageRepository)
/* eslint no-new: "error" */
new GeneralFeature(bot.getBot())
new Trivia(bot.getBot())
// Start bot

bot.start()
