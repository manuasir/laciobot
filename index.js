const Bot = require('./bot')
const bot = new Bot(process.env.TOKEN, process.env.NODE, process.env.dburl)
require('./app')(process.env.TOKEN)

// Loading modules...
bot.start().then( () => {}).catch(e =>{
  console.error('error in somewhere at starting bot ',e)
})
