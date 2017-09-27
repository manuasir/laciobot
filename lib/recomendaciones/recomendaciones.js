
const genres       = require('../utils/genres').genres;
const doRequest = require('../utils/utils').doGetRequest;
const _ = require('lodash');
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = function(bot){

  /**
   * Recomienda una peli
   */
  bot.on(['/dimeunapeli'], async (msg) => {
    try {
      const indice = getRandomInt(0,1000)
      const pickOne = getRandomInt(0,19)
      const response = await doRequest('https://api.themoviedb.org/3/discover/movie?vote_average.gte=1&page='+indice+'&api_key=fafb20e40a530b82d65bea4c6e7f28cd&language=es');
      const unaPeli = JSON.parse(response);
      const respJson = unaPeli.results[pickOne];
      let puntuacion = "";
      let puntos = (_.isUndefined(respJson.vote_average)) ? 'sin puntuacion' : respJson.vote_average ;
      if( typeof puntos == String)
        puntuacion = 'sin puntuacion\n';
      else if(puntos >= 7.5 )
        puntuacion = "🥇 Puntuación media: "+puntos+"\n";
      else if(puntos > 5)
        puntuacion = "🥈Puntuación media: "+puntos+"\n";
      else if(puntos <= 5)
        puntuacion = "🥉 Puntuación media: "+puntos+"\n";

      let gens = _.map(_.filter(genres,function(o){ if(respJson.genre_ids.includes(o.id)) return o.name }),'name');
      let overview = (respJson.overview==="") ? 'no hay overview' : respJson.overview;
      const poster = "https://image.tmdb.org/t/p/w500/"+respJson.poster_path;
      //msg.reply.sticker(poster, { asReply: true });
      msg.reply.text("🎬 Título original: "+respJson.original_title+"\n"+
        puntuacion+
        "📆 Fecha: "+respJson.release_date+"\n"+
        "🎥 Género/s: "+gens+"\n"+
        "🎥 Popularidad: "+respJson.popularity+'\n'+
        "🎥 Overview: "+ overview +"\n")
    } catch (err) {
      console.error("error en dimeunapeli ",err);
      throw err;
    }
  });

  /**
   * Recomienda una serie
   */
  bot.on(['/dimeunaserie'], async (msg) => {
    try {
      const indice = getRandomInt(0,648)
      const pickOne = getRandomInt(0,19)
      const response = await doRequest('https://api.themoviedb.org/3/discover/tv?vote_average.gte=1&page='+indice+'&api_key=fafb20e40a530b82d65bea4c6e7f28cd&language=es');
      const unaPeli = JSON.parse(response);
      const respJson = unaPeli.results[pickOne];
      let puntuacion = "";
      let puntos = (_.isUndefined(respJson.vote_average)) ? 'sin puntuacion' : respJson.vote_average ;
      if( typeof puntos == String)
        puntuacion = 'sin puntuacion\n';
      else if(puntos >= 7.5 )
        puntuacion = "🥇 Puntuación media: "+puntos+"\n";
      else if(puntos > 5)
        puntuacion = "🥈Puntuación media: "+puntos+"\n";
      else if(puntos <= 5)
        puntuacion = "🥉 Puntuación media: "+puntos+"\n";

      let gens = _.map(_.filter(genres,function(o){ if(respJson.genre_ids.includes(o.id)) return o.name }),'name');
      let overview = (respJson.overview==="") ? 'no hay overview' : respJson.overview;
      const poster = "https://image.tmdb.org/t/p/w500/"+respJson.poster_path;
      //msg.reply.sticker(poster, { asReply: true });
      msg.reply.text("🎬 Título original: "+respJson.name+"\n"+
        puntuacion+
        "📆 Fecha: "+respJson.first_air_date+"\n"+
        "🎥 Género/s: "+gens+"\n"+
        "🎥 Popularidad: "+respJson.popularity+'\n'+
        "🎥 Overview: "+ overview +"\n")
    } catch (err) {
      console.error("error en dimeunapeli ",err);
      throw err;
    }
  });

};
