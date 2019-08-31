
class Storage {
  /**
   * Class Storage
   * Manages the I/O methods for persistent data
   * @param {Stromg} url The connection URL
   */
  constructor(url) {
    try {
      this.Connection = require('./connection')
      this.connection = new this.Connection(url)
    } catch (error) {
      console.error(error)
    }

  }
}

module.exports = Storage