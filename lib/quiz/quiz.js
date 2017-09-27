
const Entities = require('html-entities').XmlEntities;
const doRequest = require('../utils/utils').doGetRequest;
const entities = new Entities();
const translate = require('node-google-translate-skidz');
const Answer = require('../db/models/answers');
const User = require('../db/models/user');
let lastMessage = {};
let canAskMulti = {};
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = function(bot){

  bot.on(['/clasificacion'], async (msg) => {
    try {
      let username = msg.from.username || msg.from.first_name;
      let tmpP = await User.findOne({userId:msg.from.id});
      if (tmpP) {
        let tmpAnswer = await Answer.findOne({userId:tmpP._id});
        return msg.reply.text(username+':\nTotal de aciertos:'+tmpAnswer.aciertos+'\n'+'Total de fallos: '+tmpAnswer.fallos);
      }
    } catch (err) {
      throw err;
    }
  });

  /**
   * Ayuda con preguntas
   */
  bot.on(['/pregunta'], async (msg) => {
    return msg.reply.text('Uso:\n/pregunta + \n[cine,tv,musica,libros,historia\nvideojuegos,arte,juegosmesa,animales]');
  });

  bot.on([/^\/pregunta (.+)$/], async (msg,props) => {
    try {
      const id = msg.chat.id;
      if(!props.match)
        return msg.reply.text('Faltan parámetros. Ej. /contactos lacasitos')

      const what = props.match[1]
      let category;
      switch(what){
        case 'cine': category = 11; break;
        case 'tv': category = 14;break;
        case 'musica': category = 12;break;
        case 'libros': category = 10;break;
        case 'historia': category = 23;break;
        case 'videojuegos': category = 15;break;
        case 'arte': category = 25;break;
        case 'juegosmesa': category = 16;break;
        case 'animales': category = 27;break;
      }
      if(canAskMulti[id])
        return bot.sendMessage(msg.chat.id, 'Hay preguntas pendientes');
      canAskMulti[id]=true;
      const result = await makeQuestion(id,category);
      let replyMarkup = result.replyMarkup;
      return bot.sendMessage(id, result.question, {replyMarkup}).then(re => {
        lastMessage[msg.chat.id] = [msg.chat.id, re.result.message_id];
      });

    } catch (err) {
      console.error("error en pregunta ",err);
      throw err;
    }
  });

  // Command /hello
  bot.on('/true', async msg => {
    console.log("ACIERTO")

    let tmpP = await User.findOne({userId: msg.from.id});
    if (tmpP) {
      let tmpAnswer = await Answer.findOne({userId:tmpP._id});
      if(tmpAnswer){
        tmpAnswer.aciertos++;
        await tmpAnswer.save()
      }else {
        let nuevaRespuesta = new Answer({userId: tmpP._id, aciertos:1});
        await nuevaRespuesta.save();
      }

    }
    canAskMulti[msg.message.chat.id]=false;

    const [chatId, messageId] = lastMessage[msg.message.chat.id];
    const replyMarkup = updateKeyboard("true",msg.from.first_name);
    return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});
  });

  // Command /hello
  bot.on('/false', async msg => {
    console.log("FALLO")
    let tmpP = await User.findOne({userId: msg.from.id});
    if (tmpP) {
      let tmpAnswer = await Answer.findOne({userId:tmpP._id});
      if(tmpAnswer){
        tmpAnswer.fallos++;
        await tmpAnswer.save()
      }else {
        let nuevaRespuesta = new Answer({userId: tmpP._id, fallos:1});
        await nuevaRespuesta.save();
      }

    }
    canAskMulti[msg.message.chat.id]=false;

    const [chatId, messageId] = lastMessage[msg.message.chat.id];
    const replyMarkup = updateKeyboard("false",msg.from.first_name);
    return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});
  });

  // Button callback
  bot.on('callbackQuery', (msg) => {
    return bot.answerCallbackQuery(msg.id);
  });

  const updateKeyboard = (answer,name) => {
    let str = (answer === 'false') ? 'Fallaste' : 'Acertaste';
    return bot.inlineKeyboard([
      [
        bot.inlineButton(str+' ,'+name,{callback:'nada'})
      ]
    ]);
  }

  /**
   * Construye pregunta y respuestas en un objeto en función de la categoría.
   * @param id
   * @param category
   * @return {Promise}
   */
  const makeQuestion = async (id,category) => {
    return new Promise(async function (resolve, reject) {
      try {
        let respLength = await doRequest('https://opentdb.com/api_count.php?category=' + category);
        const theTam = JSON.parse(respLength);
        const tam = (theTam.category_question_count.total_question_count < 50) ? theTam.category_question_count.total_question_count : 50;
        const pickOne = getRandomInt(0, tam - 1);
        const response = await doRequest('https://opentdb.com/api.php?amount=50&category='+category+'&type=multiple');
        const unaPregunta = JSON.parse(response);
        const respJson = unaPregunta.results[pickOne];
        const arr = [];
        const randomIndex = getRandomInt(0, 3);
        for (let i = 0; i < respJson.incorrect_answers.length; i++) {
          arr.push({question: entities.decode(respJson.incorrect_answers[i], 'gbk'), correct: '/false'});
        }
        arr.splice(randomIndex, 0, {question: entities.decode(respJson.correct_answer, 'gbk'), correct: '/true'});
        const pregunta = entities.decode(respJson.question, 'gbk') + "\n";
        translate({
          text: pregunta,
          source: 'en',
          target: 'es'
        }, function (result) {

          let buttons = [];
          for (let resp of arr) {
            buttons.push([bot.inlineButton(String(resp.question), {callback: resp.correct})])
          }
          const replyMarkup = bot.inlineKeyboard(buttons, {resize: true});
          resolve({replyMarkup: replyMarkup, question: result.translation});
        });

      } catch (err) {
        console.error("error al crear la pregunta")
        //throw err;
        reject(err)
      }
    });
  }
}
