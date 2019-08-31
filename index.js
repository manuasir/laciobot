const Bot = require('./lib/bot')
const Storage = require('./lib/storage/storage')
const storageRepository = new Storage(process.env.dburl)
const bot = new Bot(process.env.TOKEN, storageRepository)

// Start bot

bot.start().then().catch(error => {
  console.error('Exiting:', error.message || error)
  process.exit(1)
}) 
