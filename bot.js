const TelegramBot = require('telebot')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

/**
 * Wrapper of Bot instance
 */
class Bot {
  /**
   * Constructor with params
   * @param token
   * @param mode
   * @param dbCredentials
   */
  constructor (token, mode, dbCredentials) {
    this.token = token
    this.mode = mode
    this.bot = this.setMode(this.mode)
    this.connectWithDb(dbCredentials)
    require('./lib/index')(this.bot)
    this.start()
  }

  /**
   * Get bot instance
   * @return {TelegramBot}
   */
  getBot () {
    return this.bot
  }
  /**
   *
   * @param mode
   */
  setMode (mode) {
    this.conf = this.getConf()
    let bot
    if (mode === 'production') {
      bot = new TelegramBot(this.conf)
      bot.setWebhook('https://laciobot.herokuapp.com' + this.token)
    } else {
      this.conf.polling = true
      bot = new TelegramBot(this.conf)
    }
    return bot
  }

  /**
   * Get the configuration in function of mode (env/production)
   * @return {*}
   */
  getConf () {
    console.log('Bot running in this environment: ', this.mode)
    return {
      token: this.token,
      usePlugins: ['askUser', 'commandButton']
    }
  }

  /**
   * Start the bot
   */
  start () {
    this.bot.start()
  }

  /**
   * Connect with db
   * @param dbCredentials
   * @return {Promise.<void>}
   */
  async connectWithDb (dbCredentials) {
    try {
      await mongoose.connect(dbCredentials, {useMongoClient: true})
      console.log('Connected to MongoDB!')
      await mongoose.connection.on('error', function (err) {
        console.error('el err', err)
      })
    } catch (err) {
      throw err
    }
  }
}

module.exports = Bot
