
class Addon {
  /**
   *
   * @param {String | RegEx} path
   * @param {Function} func
   */
  constructor () {
    // Fill this Array with the addons paths
    this.addons = [
      './random-pic/simpsons-pic',
      './recommendations/recommendations'
    ]
    this.loadedAddons = []
    this.loadAddons()
  }

  loadAddons () {
    try {
      this.addons.forEach((item) => {
        const Dep = require(item)
        this.loadedAddons.push(new Dep())
        console.log(`Loaded add-on ${item}`)
      })
    } catch (error) {
      throw Error(error.message || error)
    }
  }

  getAddons () {
    return this.loadedAddons
  }

  notify (entrypoint, msg, props) {
    this.loadedAddons.map(addon => addon.notify(entrypoint, msg, props))
  }
}

module.exports = Addon
