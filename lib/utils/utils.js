
const request = require('request')

/**
 * Devuelve número aleatorio en un rango,extremos incluidos
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Devuelve una promised request
 * @param {String} url An url
 * @returns {Promise}
 */
exports.doGetRequest = async (url) => {
  return new Promise( (resolve, reject) => {
    request(url, (error, res, body) => {
      if (!error && res.statusCode === 200) {
        resolve(body)
      } else {
        reject(error)
      }
    })
  })
}
