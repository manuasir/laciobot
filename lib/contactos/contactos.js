const Contact = require('../db/models/contact')

module.exports = function (bot) {
  bot.on('/contactos', async (msg) => {
    msg.reply.text('Uso: /contactos [producto]. Ej: /contactos lacasitos')
  })

  /**
   * Lista de contactos
   */
  bot.on([/^\/contactos (.+)$/], async (msg, props) => {
    try {
      if (!props.match) { return msg.reply.text('Faltan parámetros. Ej. /contactos lacasitos') }

      const what = props.match[1]
      let contacts = await Contact.find({stuff: what}).sort('-amount').exec()
      if (contacts.length < 1) { msg.reply.text('⌨ No hay contactos de ' + what + ' todavía, puedes añadir con el comando /nuevocontacto [nombre]+[telefono]+[cosas]. ' + '\n' + 'Ej: /nuevocontacto tatin 612487956 lacasitos') } else {
        let str = ''
        for (let i = 0; i < contacts.length; i++) {
          str += '-----------' + parseInt(i + 1) + '----------' + '\n'
          str += '⌨️ nombre: ' + contacts[i].name + '\n'
          str += '☎️ tlf: ' + contacts[i].tlf + '\n'
          str += '✅ cosas: ' + contacts[i].stuff.join() + '\n'
        }
        msg.reply.text(str)
      }
      return 0
    } catch (err) {
      throw err
    }
  })

  /**
   * Añadir nuevo contacto
   */
  bot.on(['/nuevocontacto'], async (msg) => {
    try {
      if (msg.text.split(' ').length < 4) {
        msg.reply.text('Faltan datos. Ej: /nuevocontacto [nombre] [tlf] [cosas]')
        return 0
      }
      let str = []
      let splittedArray = msg.text.split(' ')
      for (let i = 3; i < splittedArray.length; i++) { str.push(splittedArray[i]) }
      const newDealer = new Contact({name: splittedArray[1],
        tlf: splittedArray[2],
        stuff: str})
      await newDealer.save()
      msg.reply.text('Guardado con éxito! ✍️')
    } catch (err) {
      throw err
    }
  })
}
