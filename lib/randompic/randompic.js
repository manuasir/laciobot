const doRequest = require('../utils/utils').doGetRequest
const token = process.env.facebookToken
const getRandomInt = require('../utils/utils')

/**
 * Interfaz exportable en el patrón Facade
 * @param bot
 */
module.exports = (bot) => {
  
  /**
   * Envia una imagen de los simpsons
   */
  bot.on(['/simpsons'], async (msg, props) => {
    try {
      if (!token || token === '') {
        return msg.reply.text('GraphQL token not valid.')
      }
      const totalStr = await doRequest(`https://graph.facebook.com/v4.0/138139046269329?access_token=${token}&fields=count,photos.fields(source).limit(100)`)
      const totalJson = JSON.parse(totalStr)
      const total = totalJson.count
      
      const resultStr = await doRequest(`https://graph.facebook.com/v4.0/138139046269329?access_token=${token}&fields=count,photos.fields(source).limit(100)`)
      const result = JSON.parse(resultStr)
      const pickOne = getRandomInt.getRandomInt(0, 100)
      return msg.reply.photo(result.photos.data[pickOne].source)
    } catch (err) {
      console.error('Error in /simpsons', err.message || err)
    }
  })

}
