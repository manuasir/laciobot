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
    this.dbCredentials = dbCredentials
    this.bot = new TelegramBot(this.getBaseConf())
    require('./index')(this.bot)
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
        await this.bot.setWebhook(process.env.APP_URL || 'https://laciobot.herokuapp.com:443/' + this.token)
      }
      return 0
    } catch(err){
      return Promise.reject(err)
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
      usePlugins: ['askUser', 'commandButton'],
      webHook: {
        // Port to which you should bind is assigned to $PORT variable
        // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
        port: process.env.PORT
        // you do NOT need to set up certificates since Heroku provides
        // the SSL certs already (https://<app-name>.herokuapp.com)
        // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
      }
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
      return Promise.reject(err)
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
        console.error('err at connecting mongodb :(', err)
      })
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = Bot
