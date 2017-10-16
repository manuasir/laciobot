const Bot = require('./bot')
const bot = new Bot(process.env.TOKEN, process.env.NODE, process.env.dburl)

// Loading modules...
bot.start().then( () => {
// one it's loaded, start server
  //require('./app')(bot)
}).catch(e =>{
  console.error('error ',e)
})
