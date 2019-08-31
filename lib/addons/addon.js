
class Addon {
  /**
   * 
   * @param {String | RegEx} path 
   * @param {Function} func 
   */
  constructor(bot) {
    this.bot = bot
    // Fill this Array with the addons paths
    this.addons = ['./random-pic/simpsons-pic']
    this.loadAddons()
  }

  loadAddons() {
    try {
      this.addons.forEach((item) => {
        const Dep = require(item)
        new Dep(this.bot)
      })
    } catch (error) {
      throw Error(error.message || error)
    }

  }

}

module.exports = Addon