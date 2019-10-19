
class RandomSimpsonPic {
  constructor (facebookToken) {
    this.utils = require('../../utils/utils')
    this.token = (facebookToken) || (process.env.facebookToken ? process.env.facebookToken : '')
    this.album = '138139046269329'
  }

  /**
   * Paginates over the GraphQl API and returns a random photo
   * @returns {String} The photo URL
   */
  async pickOneFromAlbum (album) {
    try {
      if (!this.token || this.token === '') {
        throw Error('GraphQL token not valid.')
      }
      const randomPage = this.utils.getRandomInt(1, 100)
      const resultStr = await this.utils.doRequest(`https://graph.facebook.com/v4.0/${album}/photos?pretty=0&fields=source&limit=100&access_token=${this.token}&offset=${randomPage}`)
      const result = JSON.parse(resultStr)
      const randomItem = this.utils.getRandomInt(0, 100)
      const dataSize = result.data.length
      const pickOne = (randomItem <= dataSize - 1) ? randomItem : dataSize - 1
      return result.data[pickOne].source
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async notify (entrypoint, msg, props) {
    try {
      if (entrypoint === '/simpsons') {
        const picture = await this.pickOneFromAlbum(this.album)
        return msg.reply.photo(picture)
      }
      return
    } catch (err) {
      console.error('Error in /simpsons', err.message || err)
    }
  }
}

module.exports = RandomSimpsonPic
