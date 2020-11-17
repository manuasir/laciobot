const Word = require('../db/models/word')
const User = require('../db/models/user')
const forbiddenWords = require('./forbidden-words')

class GeneralFeatures {

  constructor(bot) {
    this.bot = bot
    this.bot.on('text', async (msg) => this.read(msg))
    this.bot.on('/metrics', async (msg) => this.getMetrics(msg))
    this.bot.on('newChatMembers', async (msg) => this.newUser(msg))
    this.bot.on('reconnected', async (msg) => this.newUser(msg))
  }

  async reconnected(msg) {
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
  }

  async getUser(username) {
    try {
      const user = await User.findOne({ username: username })
      return user
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async saveUser(username) {
    try {
      userFromDb = new User({ username: username, userId: msg.from.id })
      await userFromDb.save()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async processWord(words) {
    try {

      for (let word of words) {
        if (!(word.includes('/')) && word.length > 3 &&
          !forbiddenWords.includes(word)) {
          let tmpP = await Word.findOne({ word: word })
          if (tmpP) {
            tmpP.amount++
          } else {
            tmpP = new Word({ word: word })
          }
          await tmpP.save()
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async read(msg) {
    try {
      let username = msg.from.username || msg.from.first_name
      let userFromDb = await this.getUser(username)
      if (!userFromDb) {
        await this.saveUser(username)
        msg.reply.text('Laci@ @' + `${username}` + ' bienvenid@.')
      }
      let words = msg.text.split(' ')
      await this.processWord(words)
      return
    } catch (err) {
      console.error(err)
    }
  }

  async getMetrics(msg) {
    try {
      let words = await Word.find({}).sort('-amount').limit(3).exec()
      let response = ''
      if (words.length >= 1) {
        for (let word of words) {
          response += `\n- ${word.word} (${word.amount} veces)`
        }
        msg.reply.text(response)
      } else {
        msg.reply.text('Hablad más, lacios')
      }
      return
    } catch (err) {
      console.error('Full trace error', err)
      msg.reply.text('Error desconocido obteniendo métricas, consulta los logs :(')
    }
  }

  async newUser(msg) {
    try {
      const username = msg.new_chat_member.username.toLowerCase()
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
  }
}

module.exports = GeneralFeatures