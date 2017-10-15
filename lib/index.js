
// Facade design
module.exports = function (bot) {
  // Here we load interfaces
  require('./quiz/quiz')(bot)
  require('./general/general')(bot)
  require('./contactos/contactos')(bot)
  require('./recomendaciones/recomendaciones')(bot)
}
