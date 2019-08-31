
const request = require('request')

const utils = {
  /**
   * Returns a random number in a range
   * @param {Number} min
   * @param {Number} max
   * @return {Number}
   */
  getRandomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /**
   * 
   * @param {String} url The URL to preform GET over
   */
  doRequest : async (url) => {
    return new Promise((resolve, reject) => {
      request(url, (error, res, body) => {
        if (!error && res.statusCode === 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }
}

module.exports = utils