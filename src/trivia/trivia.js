const got = require('got')
const categories = require('./categories')
const Entities = require('html-entities').XmlEntities

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

  updateKeyboard(data) {
    if (!data) {
      return this.bot.inlineKeyboard([
        [this.bot.inlineButton('Fallo', { callback: 'fail' })]
      ])
    }
    return this.bot.inlineKeyboard([
      [this.bot.inlineButton('Acertaste', { callback: 'correct' })]
    ])
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
      const messageId = this.lastMessage[chatId]
      const replyMarkup = this.updateKeyboard(data.isCorrect)
      // Edit message markup
      delete this.lastMessage[chatId]
      return this.bot.editMessageReplyMarkup({ chatId, messageId }, { replyMarkup })
    } catch (error) {
      console.error(error.message || error)
    }
  }

  help(msg) {
    return msg.reply.text('Uso:\n/pregunta + \n[cine,tv,musica,libros,historia\nvideojuegos,arte,juegosmesa,animales\nnaturaleza,mitologia]')
  }

  getCategoryId(category) {
    return categories[category]
  }

  async translate(words) {
    try {
      // const result = await got(`${this.translateUrl}gtx&sl=en&tl=es&dt=t&q=${words}`)
      // const jsonRes = JSON.parse(result.body)
      // return jsonRes[0][0][0]
      return `'Brendan Fraser protagonizó las siguientes películas, excepto ¿cuál?; Monkeybone; Encino Man; Mrs. '`
    } catch (error) {
      return Promise.reject(error.message || error)
    }
  }

  async translateFullQuestion(question) {
    try {
      const str = `${question.question};${question.answers.map(item => item.answer).join(';')}`
      const msgs = await this.translate(str)
      const splittedAnswers = msgs.split(';')
      question['question'] = splittedAnswers[0]
      question.answers.map((item, i) => item.answer = `${splittedAnswers[i + 1]} (${item.answer})`)
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
      const question = await this.getFormattedQuestion(categoryId, msg.chat.id)
      const translatedQuestion = await this.translateFullQuestion(question)
      const buttons = translatedQuestion.answers.map((item) => {
        return [this.bot.inlineButton(item.answer, {
          callback: JSON.stringify(item)
        })]
      })
      const replyMarkup = this.bot.inlineKeyboard(buttons, { resize: true })
      const data = await this.bot.sendMessage(msg.chat.id, translatedQuestion.question, { replyMarkup })
      this.lastMessage[msg.chat.id] = data.message_id
    } catch (error) {
      console.error(error.message || error)
      msg.reply.text('No pude generar la pregunta 😔 sorry pish')
    }
  }

  async getFormattedQuestion(catId, chatId) {
    try {
      // const result = await got(`${this.url}&category=${catId}`)

      // if (!result || !result.body || typeof result.body !== 'string' || result.body.length === 0) {
      //   throw new Error('Empty question')
      // }
      // const questionObj = JSON.parse(result.body)
      // if (!questionObj || !Array.isArray(questionObj.results) || questionObj.results.length === 0) {
      //   throw new Error('Empty question')
      // }
      // const finalQuestion = questionObj.results[0]
      // const finalObj = {
      //   question: this.entities.decode(finalQuestion.question),
      //   answers: [
      //     ...finalQuestion.incorrect_answers.map((item) => { return { answer: item, isCorrect: false } }),
      //     { answer: finalQuestion.correct_answer, isCorrect: true }
      //   ]
      // }
      // return finalObj
      return {
        question: 'The colour of the pills in the Matrix were Blue and Yellow.',
        answers: [
          { answer: 'True', isCorrect: true },
          { answer: 'False', isCorrect: false }
        ]
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

}

module.exports = Trivia