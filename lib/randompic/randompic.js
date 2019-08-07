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
      return msg.reply.text('No implementado (de momento)')
    } catch (err) {
      console.error('Error in /simpsons', err.message || err)
    }
  })

}
