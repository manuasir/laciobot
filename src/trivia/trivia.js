const got = require('got')
const categories = require('./categories')
const Entities = require('html-entities').XmlEntities
const Question = require('../db/models/question')
class Trivia {

  constructor(bot) {
    this.bot = bot
    this.entities = new Entities()
    this.translateUrl = `https://translate.googleapis.com/translate_a/single?client=`
    this.url = `https://opentdb.com/api.php?amount=1`
    this.bot.on('/pregunta', (msg) => this.makeQuestion(msg))
    this.bot.on('ask.question', (msg) => this.answer(msg))
    this.bot.on('callbackQuery', (msg) => this.callback(msg))
    this.lastMessage = {}
  }

  async saveAnswer(userId, category, success, chatId) {
    try {
      if (!userId || !category || typeof success !== 'boolean') {
        throw new Error('Missing userId, category or result')
      }
      const reg = new Question({ userId: userId, category: category, result: success, chatId: chatId })
      await reg.save()
    } catch (error) {
      return Promise.reject(error.message || error)
    }
  }

  updateKeyboard(data) {
    if (!data) {
      return this.bot.inlineKeyboard([
        [this.bot.inlineButton('Fallo', { callback: '{ "result": "fail" }' })]
      ])
    }
    return this.bot.inlineKeyboard([
      [this.bot.inlineButton('Acertaste', { callback: '{ "result": "correct" }' })]
    ])
  }

  async getCategoryResultsByUserId(chatId, category, userId) {
    try {
      const totalSuccess = await Question.find({ chatId: chatId, userId: userId, category: category, result: true }).countDocuments()
      const totalFail = await Question.find({ chatId: chatId, userId: userId, category: category, result: false }).countDocuments()
      return { totalSuccess: totalSuccess, totalFail: totalFail }
    } catch (error) {
      return Promise.reject(error.message || error)
    }
  }

  /**
   * On button callback
   * @param {Object} msg
   */
  async callback(msg) {
    try {
      // Send confirm check

      this.bot.answerCallbackQuery(msg.id)
      const data = JSON.parse(msg.data)
      const chatId = msg.message.chat.id
      if (!this.lastMessage || !this.lastMessage[chatId] || !this.lastMessage[chatId].mayClick || typeof data.isCorrect !== 'boolean') {
        return
      }
      this.lastMessage[chatId].mayClick = false
      const userId = msg.from.id
      const messageId = this.lastMessage[chatId].msgId
      const category = data.c
      const replyMarkup = this.updateKeyboard(data.isCorrect)
      // Edit message markup
      delete this.lastMessage[chatId]
      await this.bot.editMessageReplyMarkup({ chatId, messageId }, { replyMarkup })
      await this.saveAnswer(userId, category, data.isCorrect, chatId)
      const results = await this.getCategoryResultsByUserId(chatId, category, userId)
      const strMsg = `Tus resultados en la categoría ${this.getCategoryById(category)} son:\n${results.totalFail} fallos y ${results.totalSuccess} aciertos.`
      return await this.bot.sendMessage(chatId, strMsg)
    } catch (error) {
      console.error(error.message || error)
    }
  }

  help(msg) {
    return msg.reply.text('Uso:\n/pregunta + \n[cine,tv,musica,libros,historia\nvideojuegos,arte,juegosmesa,animales\nnaturaleza,mitologia]')
  }

  getCategoryById(categoryId) {
    const entries = Object.entries(categories)
    const filtered = entries.filter(item => item[1] == categoryId)[0][0]
    return filtered
  }

  getCategoryId(category) {
    return categories[category]
  }

  async translate(words) {
    try {
      const result = await got(`${this.translateUrl}gtx&sl=en&tl=es&dt=t&q=${words}`)
      const jsonRes = JSON.parse(result.body)
      return jsonRes[0][0][0]
    } catch (error) {
      const nonTranslatedWords = { error: 'Translator does not work', words: words }
      return Promise.reject(nonTranslatedWords)
    }
  }

  async checkTraductorAvailability(str) {
    return new Promise((resolve,reject) => {
      this.translate(str).then(data => {
        return resolve(data)
      }).catch((error) => {
        return resolve(error.words)
      })
    })
  }

  async translateFullQuestion(question) {
    try {
      const str = `${question.question};${question.answers.map(item => item.answer).join(';')}`
      const translatedQuestion = await this.checkTraductorAvailability(str)
      const splittedAnswers = translatedQuestion.split(';')
      question['question'] = splittedAnswers[0]
      question.answers.map((item, i) => item.answer = `${splittedAnswers[i + 1]}`)
      return question
    } catch (error) {
      return Promise.reject(error.message || error)
    }
  }

  async makeQuestion(msg) {
    try {
      if (this.lastMessage[msg.chat.id]) {
        return msg.reply.text('Hay preguntas pendientes bish.')
      }
      const category = msg.text.split(' ')[1]
      const categoryId = categories[category]
      if (!category || !categoryId || isNaN(categoryId)) {
        return this.help(msg)
      }
      const question = await this.getFormattedQuestion(categoryId)
      const translatedQuestion = await this.translateFullQuestion(question)
      const buttons = translatedQuestion.answers.map((item) => {
        item.c = categoryId
        return [this.bot.inlineButton(item.answer, {
          callback: JSON.stringify(item)
        })]
      })
      const replyMarkup = this.bot.inlineKeyboard(buttons, { resize: true })
      const data = await this.bot.sendMessage(msg.chat.id, translatedQuestion.question, { replyMarkup })
      this.lastMessage[msg.chat.id] = { msgId: data.message_id, mayClick: true }
    } catch (error) {
      console.error(error.message || error)
      msg.reply.text('No pude generar la pregunta 😔 sorry pish')
    }
  }

  sanitizeString(str) {
    return str.replace(/\&/g, 'and').replace(/\:/g, ' ').replace(/\-/g, ' ').replace(/\(/g, ' ').replace(/\)/g, ' ').replace(/\,/g, ' ').replace(/\./g, ' ').replace(/\;/g, ' ')
  }

  cutStr(item, size) {
    return item.substring(0, size).trim()
  }

  async getFormattedQuestion(catId) {
    try {
      const result = await got(`${this.url}&category=${catId}`)
      if (!result || !result.body || typeof result.body !== 'string' || result.body.length === 0) {
        throw new Error('Empty question')
      }
      const questionObj = JSON.parse(result.body)
      if (!questionObj || !Array.isArray(questionObj.results) || questionObj.results.length === 0) {
        throw new Error('Empty question')
      }
      const finalQuestion = questionObj.results[0]
      const randomIndex = Math.floor(Math.random() * finalQuestion.incorrect_answers.length - 1)
      const finalObj = {
        question: this.entities.decode(finalQuestion.question).replace(/\;/g, ':'),
        answers: [
          ...finalQuestion.incorrect_answers.map((item) => {
            if (item.length >= 26) {
              item = this.cutStr(item, 26)
            }
            return { answer: this.entities.decode(this.sanitizeString(item)), isCorrect: false }
          })
        ]
      }
      const correctAnswer = this.cutStr(this.sanitizeString(finalQuestion.correct_answer), 26)
      finalObj.answers.splice(randomIndex, 0, { answer: correctAnswer, isCorrect: true })
      return finalObj
    } catch (error) {
      console.error('error making obj ', error)
      return Promise.reject(error)
    }
  }

}

module.exports = Trivia