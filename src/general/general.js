const Msg = require('../db/models/message')
const User = require('../db/models/user')

class GeneralFeatures {

  constructor(bot) {
    this.bot = bot
    this.bot.on('text', async (msg) => this.read(msg))
    this.bot.on('/metrics', async (msg) => this.getMetrics(msg))
    this.bot.on('newChatMembers', async (msg) => this.newUser(msg))
    this.bot.on('reconnected', async (msg) => this.newUser(msg))
  }


  compare( a, b ) {
    if ( a.qty > b.qty ){
      return -1
    }
    if ( a.qty < b.qty ){
      return 1
    }
    return 0
  }

  getMostActiveUsers(users) {
    let result = []
    users.reduce((res, value) => {
      if (!res[value.username]) {
        res[value.username] = { username: value.username, qty: 0 }
        result.push(res[value.username])
      }
      res[value.username].qty ++
      return res
    }, {})
    return result
  }

  async getMetrics(msg) {
    try {
      const words = await Msg.find({ chatId: "-452578656" })
      const topUsers = this.getMostActiveUsers(words).sort(this.compare)
      console.log(topUsers)
      msg.reply.text(`Mensajes enviados en este chat: ${words.length}\nUsuario más activo: ${topUsers[0].username} con ${topUsers[0].qty} mensajes.`)
    } catch (error) {
      console.error(error.message || error)
      msg.reply.text('Error obteniendo métricas 😔. Consulta los logs internos.')
    }
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

  async checkUser(msg) {
    try {
      const username = this.getUsername(msg)
      const userFromDb = await this.getUser(username)
      if (!userFromDb) {
        await this.saveUser(msg)
        msg.reply.text('Laci@ @' + `${username}` + ' bienvenid@.')
      }
    } catch (error) {
      return Promise.reject(error)
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

  async saveUser(msg) {
    try {
      const userFromDb = new User({ username: msg.from.username, userId: msg.from.id })
      await userFromDb.save()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async processMsg(msg) {
    try {
      if (!msg.text.startsWith('/')) {
        const msgModel = new Msg({ msg: msg.text, username: msg.from.username || msg.from.id, chatId: msg.chat.id, date: msg.date })
        await msgModel.save()
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getUsername(msg) {
    return msg.from.username || msg.from.first_name || msg.from.id
  }

  async read(msg) {
    try {
      await this.checkUser(msg)
      await this.processMsg(msg)
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