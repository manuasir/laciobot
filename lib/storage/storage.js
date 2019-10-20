
class Storage {
  /**
   * Class Storage
   * Manages the I/O methods for persistent data
   * @param {Stromg} url The connection URL
   */
  constructor() {
    this.Connection = require('./connection')
  }

  async connect(url) {
    try {
      this.connection = new this.Connection(url)
      await this.connection.connectWithDb()
    } catch (error) {
      throw Error('Cannot connect with DataBase. ',error)
    }
  }



}

module.exports = Storage
