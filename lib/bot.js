
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
    this.Storage = require('./storage/storage.js')
    this.Addons = require('./addons/addon.js')
    this.addons = []
  }

  loadAddons () {
    try {
      this.addonsInterface = new this.Addons()
      this.addons = this.addonsInterface.getAddons()
    } catch (error) {
      console.error('Cannot load AddOns interface: ', error)
    }
  }
  /**
   * Get bot instance
   * @return {TelegramBot}
   */
  get Bot () {
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

  notifyPlugins (entrypoint, msg, props) {
    try {
      this.addonsInterface.notify(entrypoint, msg, props)
    } catch (error) {
      console.error('Error notifying plugins.')
    }
  }

  /**
   * Start the bot
   */
  async start () {
    try {
      this.loadAddons()
      this.bot.start()
      this.bot.on('*', (msg, props) => {
        this.notifyPlugins(msg.text, msg, props)
      })
      return
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = Bot
