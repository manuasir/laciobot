const mongoose = require('mongoose')

class Connection {
  constructor () {
    try {
      mongoose.Promise = global.Promise
      mongoose.set('useCreateIndex', true)
    } catch (error) {
      console.error('Error connecting MongoDB: ', error.message || error)
    }
  }

  /**
   * Connect with db
   * @return {Promise.<void>}
   */
  async connectWithDb (dbCredentials) {
    try {
      if (!dbCredentials) {
        throw new Error('Required credentials.')
      }
      await mongoose.connect(dbCredentials, { useNewUrlParser: true, useUnifiedTopology: true })
      mongoose.connection.on('error', (err) => {
        throw Error(err)
      })
      return
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }
}

module.exports = Connection
