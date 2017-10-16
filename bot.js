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
    this.dbCredentials = dbCredentials
    this.bot = new TelegramBot(this.getBaseConf())
    require('./lib/index')(this.bot)
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
  async setMode () {
    try{
      if (this.mode === 'production') {
        await this.bot.setWebhook('https://laciobot.herokuapp.com' + this.token)
      }
      return 0
    } catch(err){
      throw err
    }
  }

  /**
   * Get the configuration in function of mode (env/production)
   * @return {*}
   */
  getBaseConf () {
    console.log('Bot running in this environment: ', this.mode)
    return process.env.NODE === "production" ? {
      token: this.token,
      usePlugins: ['askUser', 'commandButton']
    } : { token: this.token,
      usePlugins: ['askUser', 'commandButton'],
      polling:true
    }
  }

  /**
   * Start the bot
   */
  async start () {
    try {
      await this.setMode()
      await this.connectWithDb(this.dbCredentials)
      this.bot.start()
    } catch(err) {
      throw err
    }
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
