
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
  constructor (token, storageRepository) {
    this.TelegramBot = require('telebot')
    this.token = token
    this.storageRepository = storageRepository
    this.bot = new this.TelegramBot(this.baseConf)
    this.plugins = ['askUser', 'commandButton']
    this.Addons = require('./addons/addon.js')
  }

  loadAddons () {
    try {
      this.addonsInterface = new this.Addons(this.Bot)
    } catch (error) {
      console.error('Cannot load AddOns interface: ', error)
    }
  }
  /**
   * Get bot instance
   * @return {TelegramBot}
   */
  get Bot () {
    return this
  }

  getBot() {
    return this.bot
  }

  /**
   * Get the configuration in function of mode (env/production)
   * @return {Object}
   */
  get baseConf () {
    return {
      token: this.token,
      usePlugins: this.plugins,
      polling: true
    }
  }

  async saveWord(user,word) {
    try {
      await this.storageRepository.saveWord(user,word)
    } catch (error) {
      return Promise.reject(error.message || error)
    }
  }

  /**
   * Start the bot
   */
  async start () {
    try {
      this.loadAddons()
      this.bot.start()
      return
    } catch (err) {
      return Promise.reject(err)
    }
  }

  reply(msg,text){
    return msg.reply.text(text)
  }
}

module.exports = Bot
