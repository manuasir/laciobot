

class Conversation {
  constructor(bot) {
    this.bot = bot
    this.reservedWords = require('./reserved-words')
  }

  writeMetric(user, words) {
    try {
      let splittedWords = words.split(' ')
 
      for (let word of splittedWords) {
        if (!(word.includes('/')) && word.length > 3 &&
          !this.reservedWords.includes(word)) {
            const savedWord = await this.bot.saveWord(user,word)
          // let tmpP = await Word.findOne({ word: word })
          const tmpUser = await this.bot.getUser(user)
          if (tmpUser) {
            tmpUser.amount++
          } else {
            tmpUser = new Word({ word: word })
          }
          await tmpP.save()
        }
      }
    } catch (error) {

    }
  }

  async processMsg(msg) {
    try {
      // Get username
      let username = msg.from.username || msg.from.first_name
      let userFromDb = await User.findOne({ username: username })
      if (!userFromDb) {
        userFromDb = new User({ username: username, userId: msg.from.id })
        await userFromDb.save()
        msg.reply.text('Laci@ @' + `${username}` + ' bienvenid@.')
      }
      await this.writeMetric(msg.text)
      return 0
    } catch (err) {
      console.error(err)
    }
  }

  attachEvents() {

    /**
     * Receives and registers a message
     */
    this.bot.on('text', async (msg) => {
      try {
        await this.processMsg(msg)
      } catch (error) {
        msg.reply('Error procesando mensaje, la habéis liado con algo.')
      }
    })

    /**
     * Ranking of words
     */
    this.bot.on(['/ranking'], async (msg) => {
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
        console.error("ERROR", err)
      }
    })

    /**
     * New user in the chat
     */
    this.bot.on(['newChatMembers'], async (msg) => {
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
    this.bot.on(['reconnected'], async (msg) => {
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

}


module.exports = Conversation