const Connection = require('./connection')
class Storage {
  /**
   * Class Storage
   * Manages the I/O methods for persistent data
   * @param {Stromg} url The connection URL
   */
  constructor (url) {
    this.url = url
  }

  async connect () {
    try {
      const conn = new Connection()
      await conn.connectWithDb(this.url)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = Storage
