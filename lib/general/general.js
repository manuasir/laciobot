const Word = require('../db/models/word')
const User = require('../db/models/user')

module.exports = function (bot) {
  /**
   * Receives and registers a message
   */
  bot.on('text', async (msg) => {
    try {
      let username = msg.from.username || msg.from.first_name
      let userFromDb = await User.findOne({ username: username })
      if (!userFromDb) {
        userFromDb = new User({ username: username, userId: msg.from.id })
        await userFromDb.save()
        msg.reply.text('Laci@ @' + `${username}` + ' bienvenid@.')
      }
      await User.findOne({ username: username })
      let words = msg.text.split(' ')
      for (let word of words) {
        if (!(word.includes('/')) && word.length > 3 &&
          !['con', 'mas', 'eso', 'esto',
            'del', 'las', 'los', 'por', 'para',
            'historia', 'tv', 'juegosmesa', 'cine', 'musica',
            'libros', 'videojuegos', 'arte', 'animales', 'mitologia',
            'naturaleza', 'qué', 'cómo', 'donde',
            'cuando', 'cuándo', 'hay', 'este'].includes(word)) {
          let tmpP = await Word.findOne({ word: word })
          if (tmpP) {
            tmpP.amount++
          } else {
            tmpP = new Word({ word: word })
          }
          await tmpP.save()
        }
      }
      return 0
    } catch (err) {
      console.error(err)
    }
  })

  /**
   * Ranking of words
   */
  bot.on(['/ranking'], async (msg) => {
    try {
      let words = await Word.find({}).sort('-amount').limit(3).exec()
      let response = ''
      if (words.length >= 1) {
        for (let word of words) {
          response += word.word + ' (' + word.amount + ' veces) \n'
          console.log(response)
        }
        msg.reply.text(response)
      } else {
        msg.reply.text('Hablad más, lacios')
      }
      return 0
    } catch (err) {
      console.error("ERROR",err)
    }
  })

  /**
   * New user in the chat
   */
  bot.on(['newChatMembers'], async (msg) => {
    try {
      var username = msg.new_chat_member.username.toLowerCase()

      let user = new User({
        username: username,
        userId: msg.new_chat_member.id
      })
      await user.save()
      msg.reply.text('Ha entrado un nuevo laci@ en el grupo')
    } catch (err) {
      if (err.code === 11000) {
        let userFromDb = await User.findOne({ username: username })
        await userFromDb.save()
        msg.reply.text('Ha entrado un viejo lacio de nuevo')
      } else {
        console.error(err)
      }
    }
  })

  /**
   * Reconnected event
   */
  bot.on(['reconnected'], async (msg) => {
    try {
      let user = new User({
        username: msg.new_chat_member.username,
        userId: msg.new_chat_member.id
      })
      await user.save()
      msg.reply.text('Ha entrado un nuevo laci@ en el grupo')
    } catch (err) {
      if (err.code === 11000) {
        let userFromDb = await User.findOne({ username: msg.new_chat_member.username })
        await userFromDb.save()
        msg.reply.text('Ha entrado un viejo lacio de nuevo')
      } else {
        console.error(err)
      }
    }
  })
}
