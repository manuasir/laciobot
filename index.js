const Bot = require('./lib/bot')
const bot = new Bot(process.env.TOKEN, process.env.NODE, process.env.dburl)
require('./lib/app')(process.env.TOKEN)

// Loading modules...
bot.start().then( () => {
  console.log('Started bot')
}).catch(e =>{
  console.error('Error starting bot. ',e.message || e)
})
