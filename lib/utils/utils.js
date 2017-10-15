
const request = require('request')

/**
 * Devuelve número aleatorio en un rango,extremos incluidos
 * @param min
 * @param max
 * @return {*}
 */
exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Devuelve una promised request
 */
exports.doGetRequest = async (url) => {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        resolve(body)
      } else {
        reject(error)
      }
    })
  })
}
