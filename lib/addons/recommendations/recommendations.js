
const genresMapping = require('./genres')
const utils = require('../../utils/utils')
const getRandomInt = require('../../utils/utils')
const countryMapping = require('./country-codes')

class Recommendations {

  /**
   * Handles recommendations
   * @param {Telebot} bot 
   * @param {String} apiKey 
   */
  constructor(bot, apiKey) {
    this.apiKey = apiKey || process.env.moviedb || ''
    this.bot = bot
    this.attachEvent()
  }

  /**
   * Writes a review
   * @param {Number} points 
   * @returns {String}
   */
  rate(points) {
    try {
      return (points === 10) ?
        '🥇 Imprescindible! Los usuarios la han calificado como sobresaliente: ' + points + '\n'
        :
        (points <= 9 && points >= 8) ?
          '🥇 Muy buena! Puntuación media: ' + points + '\n'
          :
          (points < 8 && points >= 6) ?
            '🥈 Entretenida. Puntuación media: ' + points + '\n'
            :
            (points < 6 && points >= 5) ?
              '🥈 Mediocre. Puntuación media: ' + points + '\n'
              :
              (points < 5) ?
                '🥉 Mala. Puntuación media: ' + points + '\n'
                :
                'No hay datos de puntuación'
    } catch (error) {
      throw Error(error)
    }
  }

  /**
   * Matches the genres IDs with their names
   * @param {Array} ids 
   * @returns {Array}
   */
  mapGenres(ids) {
    try {
      if (!ids || !Array.isArray(ids)) {
        throw Error('Invalid genre IDs format.')
      }
      let genres = []
      for (let i = 0; i < ids.length; i++) {
        genres.push(...genresMapping.filter(item => item.id === ids[i]).map(item => item.name))
      }
      return genres
    } catch (error) {
      throw Error(error)
    }
  }

  /**
   * Matches the country code with its name
   * @param {String} code 
   * @returns {String} The country name
   */
  getCountryName(code){
    try {
      if (!code) {
        return 'Desconocido'
      }
      return countryMapping[code]
    } catch (error) {
      throw Error('Cannot map country name: ',error)
    }

  }

  /**
   * Generates a recommendation
   * @param {String} type [tv | movie]
   */
  async recommend(type) {
    try {
      if (!this.apiKey) {
        throw Error('Missing MovieDB API KEY.')
      }
      const index = getRandomInt.getRandomInt(0, 500)
      const pickOne = getRandomInt.getRandomInt(0, 19)
      const response = await utils.doRequest(`https://api.themoviedb.org/3/discover/${type}?vote_average.gte=1&page=${index}&api_key=${this.apiKey}&language=es`)
      const aMovie = JSON.parse(response)
      const respJson = aMovie.results[pickOne]
      const points = (!respJson.vote_average) ? 'No score' : respJson.vote_average
      const score = this.rate(points)
      const genres = this.mapGenres(respJson.genre_ids)
      const overview = (respJson.overview === '') ? 'No se encontró overview' : respJson.overview
      const country = this.getCountryName(respJson.origin_country)
      return {
        score: score,
        title: respJson.original_title || respJson.original_name || 'Sin nombre.',
        date: respJson.release_date || respJson.first_air_date || 'Sin fecha.',
        genres: genres,
        popularity: respJson.popularity,
        overview: overview,
        country: country || 'Desconocido'
      }

    } catch (error) {
      console.error('Error getting info from API: ', error)
      return Promise.reject(error)
    }
  }


  async attachEvent() {

    /**
     * Recommends a movie
     */
    this.bot.on(['/recomiendapeli'], async (msg) => {
      try {

        const result = await this.recommend('movie')
        return msg.reply.text('🎬 Título: ' + result.title + '\n' +
          result.score +
          '📆 Fecha: ' + result.date + '\n' +
          '🌎 País: ' + result.country + '\n' +
          '🎥 Género: ' + result.genres + '\n' +
          '🎥 Popularidad: ' + result.popularity + '\n' +
          '🎥 Overview: ' + result.overview + '\n')
      } catch (err) {
        console.error(err)
        msg.reply.text('Error processing movie recommendation, check server logs.')
      }
    })

    /**
     * Recommends a TV show
     */
    this.bot.on(['/recomiendaserie'], async (msg) => {
      try {

        const result = await this.recommend('tv')

        return msg.reply.text('🎬 Título: ' + result.title + '\n' +
          result.score +
          '📆 Fecha: ' + result.date + '\n' +
          '🌎 País: ' + result.country + '\n' +
          '🎥 Género/s: ' + result.genres + '\n' +
          '🎥 Popularidad: ' + result.popularity + '\n' +
          '🎥 Overview: ' + result.overview + '\n')
      } catch (err) {
        console.error(err)
        return msg.reply.text('Error processing movie recommendation, check server logs.')
      }
    })

  }
}
module.exports = Recommendations
