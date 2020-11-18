const Telebot = require('telebot')

class Bot {
  constructor (token, storage) {
    this.bot = new Telebot(token)
    this.storage = storage
  }

  getBot () {
    return this.bot
  }

  async help (msg) {
    try {
      const msgStr =

        'Commands:\n' +
        '--------- \n' +
        '/metrics'
      await msg.reply.text(msgStr)
    } catch (error) {
      await msg.reply.text('Error')
      console.error('Error.', error.message || error)
    }
  }

  start () {
    try {
      this.bot.on(['/start', '/hello'], (msg) => msg.reply.text('Estoy de nuevo por aqui'))
      this.bot.on(['/help'], (msg) => this.help(msg))
      this.storage.connect().then(() => {
        this.bot.start()
      }).catch((err) => { console.error('Cannot connect to database. Reason: ', err.message || err) })
    } catch (error) {
      console.error('Error starting bot: ', error.message || error)
    }
  }
}

module.exports = Bot
