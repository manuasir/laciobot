
const request       = require('request');


/**
 * Devuelve una promised request
 */
exports.doGetRequest = async (url) => {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
};

