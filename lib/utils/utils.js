
const request = require('request')

const utils = {
  /**
   * Returns a random number in a range
   * @param {Number} min
   * @param {Number} max
   * @return {Number} The random number
   */
  getRandomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /**
   *
   * @param {String} url The URL to preform GET over
   */
  doRequest: (url) => {
    return new Promise((resolve, reject) => {
      request(url, (error, res, body) => {
        if (error) {
          console.log('Error: ', error)
          reject(error)
        }
        else if (res.statusCode !== 200) {
          reject({ message: 'Response code is not 200.', code: res.statusCode })
        } else {
          resolve(body)
        }
      })
    })
  }
}

module.exports = utils
