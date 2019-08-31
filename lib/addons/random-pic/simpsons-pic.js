const utils = require('../../utils/utils')
const token = process.env.facebookToken

class RandomSimpsonPic {
  constructor (bot) {
    this.bot = bot
    this.attachEvent()
  }

  /**
   * Paginates over the GraphQl API and returns a random photo
   * @returns {String} The photo URL
   */
  async pickOneFromAlbum (album) {
    try {
      if (!token || token === '') {
        return msg.reply.text('GraphQL token not valid.')
      }
      const randomPage = utils.getRandomInt(1, 100)
      const resultStr = await utils.doRequest(`https://graph.facebook.com/v4.0/${album}/photos?pretty=0&fields=source&limit=100&access_token=${token}&offset=${randomPage}`)
      const result = JSON.parse(resultStr)
      const randomItem = utils.getRandomInt(0, 100)
      const dataSize = result.data.length
      const pickOne = (randomItem <= dataSize - 1) ? randomItem : dataSize - 1
      return result.data[pickOne].source
    } catch (error) {
      return Promise.reject(error)
    }
  }

  attachEvent () {
    this.bot.on(['/simpsons'], async (msg, props) => {
      try {
        const picture = await this.pickOneFromAlbum('138139046269329')
        return msg.reply.photo(picture)
      } catch (err) {
        console.error('Error in /simpsons', err.message || err)
      }
    })
  }
}

module.exports = RandomSimpsonPic
