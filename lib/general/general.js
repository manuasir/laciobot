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

  async read(msg) {
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
      return
    } catch (err) {
      console.error(err)
    }
  }

  async getMetrics(msg) {
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
      return
    } catch (err) {
      console.error(err)
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