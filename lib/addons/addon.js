
class Addon {
  /**
   *
   * @param {String | RegEx} path
   * @param {Function} func
   */
  constructor(bot) {
    this.bot = bot
    // Fill this Array with the addons paths
    this.addons = ['./random-pic/simpsons-pic',
      './recommendations/recommendations']
    this.loadAddons()
  }

  loadAddons() {
    try {
      this.addons.forEach((item) => {
        const Dep = require(item)
        const obj = new Dep(this.bot)
        console.log(`Loaded add-on ${item}`)
      })
    } catch (error) {
      throw Error(error.message || error)
    }
  }
}

module.exports = Addon
