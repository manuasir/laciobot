
const Entities = require('html-entities').XmlEntities
const doRequest = require('../utils/utils').doGetRequest
const entities = new Entities()
const translate = require('node-google-translate-skidz')
const Answer = require('../db/models/answers')
const User = require('../db/models/user')
let lastMessage = {}
let canAskMulti = {}
const getRandomInt = require('../utils/utils')

/**
 * Interfaz exportable en el patrón Facade
 * @param bot
 */
module.exports = function (bot) {
  /**
   * Procesa las respuestas de los usuarios e inserta en DB los resultados, si no existian se crean instancias nuevas
   * @param msg
   * @param correct
   * @return {Promise.<*|{short, arguments}>}
   */
  const response = async (msg, correct) => {
    try {
      const [chatId, messageId, category] = lastMessage[msg.message.chat.id]
      const categoryName = category
      // Get mongodb user ID
      let tmpP = await User.findOne({ userId: msg.from.id })
      if (tmpP) {
        // Check if user has already answered questions
        let tmpAnswer = await Answer.findOne({ userId: tmpP._id })
        if (tmpAnswer) {
          // It has document
          // find if user has registered genre 
          let isThere = false
          let index
          for (let i = 0; i < tmpAnswer.temas.length && !isThere; i++) {
            if (tmpAnswer.temas[i].tema === categoryName) {
              index = i
              isThere = true
            }
          }
          if (!isThere) {
            if (correct) { tmpAnswer.temas.push({ tema: categoryName, aciertos: 1 }) } else { tmpAnswer.temas.push({ tema: categoryName, fallos: 1 }) }
            await tmpAnswer.save()
          } else {
            if (correct) { tmpAnswer.temas[index].aciertos++ } else { tmpAnswer.temas[index].fallos++ }
            await tmpAnswer.save()
          }
        } else {
          // create a new answer
          let newAnswer
          if (correct) { newAnswer = new Answer({ userId: tmpP._id, temas: [{ tema: categoryName, aciertos: 1 }] }) } else { newAnswer = new Answer({ userId: tmpP._id, temas: [{ tema: categoryName, fallos: 1 }] }) }
          await newAnswer.save()
        }
      }
      canAskMulti[msg.message.chat.id] = false
      let failOrOk = (correct) ? 'true' : 'false'
      const replyMarkup = updateKeyboard(failOrOk, msg.from.first_name)
      return bot.editMessageReplyMarkup({ chatId, messageId }, { replyMarkup })
    } catch (err) {
      console.error('error en respuesta')
      return Promise.reject(err)
    }
  }

  /**
   * Actualiza los botones tras contestar.
   * @param answer
   * @param name
   * @return {*|{inline_keyboard}}
   */
  const updateKeyboard = (answer, name) => {
    let str = (answer === 'false') ? 'Fallaste' : 'Correcto'
    return bot.inlineKeyboard([
      [
        bot.inlineButton(str, { callback: 'nada' })
      ]
    ])
  }

  /**
   * Traduce preguntas
   * @param arr
   * @param question
   * @return {Promise}
   */
  const translateQuestion = async (arr, question) => {
    return new Promise((resolve, reject) => {
      translate({
        text: question,
        source: 'en',
        target: 'es'
      }, (result, err) => {
        let buttons = []
        for (let resp of arr) {
          buttons.push([bot.inlineButton(String(resp.question), { callback: resp.correct })])
        }
        if (buttons.length === 0) { reject(err) }
        let obj = { buttons: buttons, translation: result.translation }
        resolve(obj)
      })
    })
  }

  /**
   * Construye question y respuestas en un objeto en función de la categoría.
   * @param id
   * @param category
   * @return {Promise}
   */
  const makeQuestion = async (id, category) => {
    try {
      let respLength = await doRequest('https://opentdb.com/api_count.php?category=' + category)
      const theTam = JSON.parse(respLength)
      let tam = (theTam.category_question_count.total_question_count < 50) ? theTam.category_question_count.total_question_count : 50
      const pickOne = getRandomInt.getRandomInt(0, tam)
      const response = await doRequest('https://opentdb.com/api.php?amount=' + tam + '&category=' + category)
      const aQuestion = JSON.parse(response)
      const respJson = aQuestion.results[pickOne]
      if (!respJson || !respJson.incorrect_answers) { bot.sendMessage(id, 'Hubo error al procesar') }
      const arr = []
      const randomIndex = getRandomInt.getRandomInt(0, 3)
      for (let i = 0; i < respJson.incorrect_answers.length; i++) {
        arr.push({ question: entities.decode(respJson.incorrect_answers[i], 'gbk'), correct: '/false' })
      }
      arr.splice(randomIndex, 0, { question: entities.decode(respJson.correct_answer, 'gbk'), correct: '/true' })
      const question = entities.decode(respJson.question, 'gbk') + '\n'
      let buttons = await translateQuestion(arr, question)

      const replyMarkup = bot.inlineKeyboard(buttons.buttons, { resize: true })
      return { replyMarkup: replyMarkup, question: buttons.translation }
    } catch (err) {
      console.error('error al crear la question')
      return Promise.reject(err)
    }
  }

  /**
   * Devuelve un id
   * @param whatGenre
   * @return {number}
   */
  const getCategory = (whatGenre) => {
    switch (whatGenre) {
      case 'cine': return 11
      case 'tv': return 14
      case 'musica': return 12
      case 'libros': return 10
      case 'historia': return 23
      case 'videojuegos': return 15
      case 'arte': return 25
      case 'juegosmesa': return 16
      case 'animales': return 27
      case 'mitologia': return 20
      case 'naturaleza': return 17
    }
  }

  /**
   * Clasificación y puntuaciones de los usuarios
   */
  bot.on(['/clasificacion'], async (msg) => {
    try {
      let tmpP = await User.findOne({ userId: msg.from.id })
      if (tmpP) {
        let tmpAnswer = await Answer.findOne({ userId: tmpP._id })
        let cadena = 'Puntuación de ' + tmpP.username + '\n'
        if (!tmpAnswer || !tmpAnswer.temas || tmpAnswer.temas.length < 1) { return msg.reply.text('Aún no tienes puntuaciones,no seas lacio y juega más') }

        for (let i = 0; i < tmpAnswer.temas.length; i++) {
          cadena += '---------------\n' +
            tmpAnswer.temas[i].tema + '\n' +
            'Aciertos: ' + tmpAnswer.temas[i].aciertos + '\n' +
            'Fallos: ' + tmpAnswer.temas[i].fallos + '\n'
        }

        return msg.reply.text(cadena)
      }
    } catch (err) {
      console.error('Error in /clasificacion', err.message || err)
    }
  })

  /**
   * Evento al recibir petición de question con parámetros
   */
  bot.on([/^\/pregunta$/], async (msg) => {
    try {
      return msg.reply.text('Uso:\n/pregunta + \n[cine,tv,musica,libros,historia\nvideojuegos,arte,juegosmesa,animales\nnaturaleza,mitologia]')

    } catch (error) {
      console.error('Error in /pregunta', err.message || err)
    }
  })

  /**
   * Evento al recibir petición de pregunta con parámetros
   */
  bot.on([/^\/pregunta (.+)$/], async (msg, props) => {
    try {
      const id = msg.chat.id
      const what = props.match[1]
      if (!['cine', 'tv', 'musica', 'libros', 'historia', 'videojuegos', 'arte', 'juegosmesa', 'animales',
        'naturaleza', 'mitologia'].includes(what)) {
        return bot.sendMessage(id, 'Temas disponibles:\n' +
          '[cine,tv,musica,libros,historia\\nvideojuegos,arte,juegosmesa,animales\\nnaturaleza,mitologia]\\')
      }

      let category = getCategory(what)
      if (canAskMulti[id]) { return bot.sendMessage(msg.chat.id, 'Hay preguntas pendientes') }
      canAskMulti[id] = true
      const result = await makeQuestion(id, category)
      let replyMarkup = result.replyMarkup
      return bot.sendMessage(id, result.question, { replyMarkup }).then(re => {
        lastMessage[msg.chat.id] = [msg.chat.id, re.message_id, what]
      })
    } catch (err) {
      canAskMulti[msg.chat.id] = false
      bot.sendMessage(msg.chat.id, 'Error al procesar')
      console.error('Error in /pregunta + term', err.message || err)
    }
  })

  /**
   * Si question acertada
   */
  bot.on('/true', async msg => {
    await response(msg, true)
  })

  /**
   * Si question fallada
   */
  bot.on('/false', async msg => {
    await response(msg, false)
  })

  /**
   * Redirecciona al evento que se pasa por callback
   */
  bot.on('callbackQuery', (msg) => {
    return bot.answerCallbackQuery(msg.id)
  })
}
