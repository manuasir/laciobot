const doRequest = require('../utils/utils').doGetRequest
const token = process.env.facebookToken
const getRandomInt = require('../utils/utils')

/**
 * Interfaz exportable en el patrón Facade
 * @param bot
 */
module.exports = (bot) => {


  /**
   * Paginates over the GraphQl API and returns a random photo
   * @returns {String} The photo URL
   */
  const pickOneFromAlbum = async (album) => {
    try {
      if (!token || token === '') {
        return msg.reply.text('GraphQL token not valid.')
      }
      const randomPage = getRandomInt.getRandomInt(1, 100)
      const resultStr = await doRequest(`https://graph.facebook.com/v4.0/${album}/photos?pretty=0&fields=source&limit=100&access_token=${token}&offset=${randomPage}`)
      const result = JSON.parse(resultStr)
      const randomItem = getRandomInt.getRandomInt(0, 100)
      const dataSize = result.data.length
      const pickOne = ( randomItem <= dataSize-1 ) ? randomItem : dataSize-1
      return result.data[pickOne].source
    } catch (error) {
      return Promise.reject(error)
    }

  }


  /**
   * Sends a random Simpsons picture
   */
  bot.on(['/simpsons'], async (msg, props) => {
    try {
      const picture = await pickOneFromAlbum('1639510879619426')
      return msg.reply.photo(picture)
    } catch (err) {
      console.error('Error in /simpsons', err.message || err)
    }
  })
}
