
// Facade design
module.exports = (bot) => {
  // Here we load interfaces
  require('./quiz/quiz')(bot)
  require('./general/general')(bot)
  require('./contacts/contact')(bot)
  require('./recomendations/recomendations')(bot)
}
