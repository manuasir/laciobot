
const genres = require('../utils/genres').genres
const doRequest = require('../utils/utils').doGetRequest
const _ = require('lodash')
const getRandomInt = require('../utils/utils')

module.exports = function (bot) {

  /**
   * Recommends a movie
   */
  bot.on(['/dimeunapeli'], async (msg) => {
    try {
      const index = getRandomInt.getRandomInt(0, 1000)
      const pickOne = getRandomInt.getRandomInt(0, 19)
      const response = await doRequest('https://api.themoviedb.org/3/discover/movie?vote_average.gte=1&page=' + index + '&api_key=fafb20e40a530b82d65bea4c6e7f28cd&language=es')
      const aMovie = JSON.parse(response)
      const respJson = aMovie.results[pickOne]
      let score = ''
      let points = (_.isUndefined(respJson.vote_average)) ? 'sin score' : respJson.vote_average
      if (typeof points === 'string') { score = 'sin score\n' } else if (points >= 7.5) { score = '🥇 Puntuación media: ' + points + '\n' } else if (points > 5) { score = '🥈Puntuación media: ' + points + '\n' } else if (points <= 5) { score = '🥉 Puntuación media: ' + points + '\n' }
      let gens = _.map(_.filter(genres, function (o) { if (respJson.genre_ids.includes(o.id)) return o.name }), 'name')
      let overview = (respJson.overview === '') ? 'no hay overview' : respJson.overview
      msg.reply.text('🎬 Título original: ' + respJson.original_title + '\n' +
        score +
        '📆 Fecha: ' + respJson.release_date + '\n' +
        '🎥 Género/s: ' + gens + '\n' +
        '🎥 Popularidad: ' + respJson.popularity + '\n' +
        '🎥 Overview: ' + overview + '\n')
    } catch (err) {
      err.message = 'Error en dimeunapeli'
      return Promise.reject(err)
    }
  })

  /**
   * Recommends a TV show
   */
  bot.on(['/dimeunaserie'], async (msg) => {
    try {
      const index = getRandomInt.getRandomInt(0, 648)
      const pickOne = getRandomInt.getRandomInt(0, 19)
      const response = await doRequest('https://api.themoviedb.org/3/discover/tv?vote_average.gte=1&page=' + index + '&api_key=fafb20e40a530b82d65bea4c6e7f28cd&language=es')
      const aTvShow = JSON.parse(response)
      const respJson = aTvShow.results[pickOne]
      let score = ''
      let points = (_.isUndefined(respJson.vote_average)) ? 'sin score' : respJson.vote_average
      if (typeof points === 'string') { score = 'sin score\n' } else if (points >= 7.5) { score = '🥇 Puntuación media: ' + points + '\n' } else if (points > 5) { score = '🥈Puntuación media: ' + points + '\n' } else if (points <= 5) { score = '🥉 Puntuación media: ' + points + '\n' }

      let gens = _.map(_.filter(genres, function (o) { if (respJson.genre_ids.includes(o.id)) return o.name }), 'name')
      let overview = (respJson.overview === '') ? 'no hay overview' : respJson.overview
      msg.reply.text('🎬 Título original: ' + respJson.name + '\n' +
        score +
        '📆 Fecha: ' + respJson.first_air_date + '\n' +
        '🎥 Género/s: ' + gens + '\n' +
        '🎥 Popularidad: ' + respJson.popularity + '\n' +
        '🎥 Overview: ' + overview + '\n')
    } catch (err) {
      console.error('error en dimeunapeli ', err)
      return Promise.reject(err)
    }
  })
}
