
class Connection {
  constructor (dbCredentials) {
    try {
      this.mongoose = require('mongoose')
      this.mongoose.Promise = global.Promise
      this.dbCredentials = dbCredentials
      this.connectWithDb()
    } catch (error) {
      console.error('Error connecting MongoDB: ', error.message || error)
    }
  }

  /**
   * Connect with db
   * @return {Promise.<void>}
   */
  async connectWithDb () {
    try {
      await this.mongoose.connect(this.dbCredentials, { useNewUrlParser: true })
      console.log('Connected to MongoDB!')
      this.mongoose.connection.on('error', (err) => {
        throw Error(err)
      })
      return
    } catch (err) {
      console.error('Error connecting MongoDB: ', err.message || err)
    }
  }
}

module.exports = Connection
