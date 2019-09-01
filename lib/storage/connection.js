
class Connection {
  constructor (dbCredentials) {
    try {
      this.mongoose = require('mongoose')
      this.mongoose.Promise = global.Promise
      this.dbCredentials = dbCredentials
      this.connectWithDb()
    } catch (error) {
      throw Error(error)
    }
  }

  /**
   * Connect with db
   * @return {Promise.<void>}
   */
  async connectWithDb () {
    try {
      await this.mongoose.connect(this.dbCredentials, { useMongoClient: true })
      console.log('Connected to MongoDB!')
      this.mongoose.connection.on('error', (err) => {
        throw Error(err)
      })
      return
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = Connection
