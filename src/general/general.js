const Msg = require('../db/models/message')
const User = require('../db/models/user')

class GeneralFeatures {
  constructor (bot) {
    this.bot = bot
    this.bot.on('text', (msg) => this.read(msg))
    this.bot.on('/metrics', (msg) => this.getMetrics(msg))
    this.bot.on('newChatMembers', (msg) => this.newUser(msg))
  }

  /**
   * Compare asc
   * @param {Object} a
   * @param {Object} b
   */
  compare (a, b) {
    if (a.qty > b.qty) {
      return -1
    }
    if (a.qty < b.qty) {
      return 1
    }
    return 0
  }

  /**
   * Get most active users
   * @param {Array<object>} users The array of users
   */
  getMsgsByUser (users) {
    const result = []
    users.reduce((res, value) => {
      if (!res[value.userId]) {
        res[value.userId] = { username: value.userId, qty: 0 }
        result.push(res[value.userId])
      }
      res[value.userId].qty++
      return res
    }, {})
    return result
  }

  async getMetrics (msg) {
    try {
      const messages = await Msg.find({ chatId: msg.chat.id })
      const topUsers = this.getMsgsByUser(messages).sort(this.compare)
      if (!topUsers || !Array.isArray(topUsers) || topUsers.length === 0) {
        return msg.reply.text(`No se encontraron métricas de usuario 😔`)
      }
      for (let user of topUsers){
        const userDb = await this.getUserById(user.username)
        user.name = userDb.username
      }
      await msg.reply.text(`Mensajes enviados en este chat: ${messages.length}\nUsuario más activo: ${topUsers[0].name} con ${topUsers[0].qty} mensajes.`)
    } catch (error) {
      console.error(error.message || error)
      return msg.reply.text('Error obteniendo métricas 😔. Consulta los logs internos.')
    }
  }

  async checkUser (msg) {
    try {
      const userFromDb = await this.getUserById(msg.from.id)
      if (!userFromDb) {
        await this.saveUser(msg)
        msg.reply.text(`Hola @${msg.from.username || msg.from.first_name || msg.from.id} 🚬`)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getUserById (userId) {
    try {
      return await User.findOne({ userId: userId })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async saveUser (msg) {
    try {
      const newUser = new User({ username: msg.from.username || msg.from.first_name, userId: msg.from.id })
      await newUser.save()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async processMsg (msg) {
    try {
      if (!msg.text.startsWith('/')) {
        const msgModel = new Msg({ msg: msg.text, userId: msg.from.id, chatId: msg.chat.id, date: msg.date })
        await msgModel.save()
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async read (msg) {
    try {
      await this.checkUser(msg)
      await this.processMsg(msg)
      return
    } catch (err) {
      console.error(err)
    }
  }

  async newUser (msg) {
    try {
      const username = msg.new_chat_member.username || msg.new_chat_member.first_name || msg.from.username || msg.from.first_name || msg.from.id
      const user = new User({
        username: username,
        userId: msg.new_chat_member.id
      })
      await user.save()
      msg.reply.text(`Ha entrado un nuevo laci@ en el grupo, hola ${username} 🚬`)
    } catch (err) {
      console.error(err.message || err)
      msg.reply.text('Error desconocido añadiendo al nuevo usuario 😔. Consulta los logs internos.')
    }
  }
}

module.exports = GeneralFeatures
