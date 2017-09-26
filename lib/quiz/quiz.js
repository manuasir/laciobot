
const Entities = require('html-entities').XmlEntities;
const doRequest = require('../utils/utils').doRequest;
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
      //console.log("clasificacion",msg)
      let tmpP = await User.findOne({userId:msg.from.id});
      console.log("el id del usuario es ",tmpP._id)
      if (tmpP) {
        let tmpAnswer = await Answer.findOne({userId:tmpP._id});
        console.log('las putnuaciones ',tmpAnswer.fallos)
        return msg.reply.text(msg.from.username+':\nTotal de aciertos:'+tmpAnswer.aciertos+'\n'+'Total de fallos: '+tmpAnswer.fallos);
      }
    } catch (err) {
      throw err;
    }
  });

  bot.on(['/pregunta'], async (msg) => {
    try {

      if(canAskMulti[msg.chat.id])
        return bot.sendMessage(msg.chat.id, 'Hay preguntas pendientes');
      //canAsk = false;
      const id = msg.chat.id;
      canAskMulti[id]=true;
      const pickOne = getRandomInt(0, 49);
      const response = await doRequest('https://opentdb.com/api.php?amount=50&category=11&type=multiple');
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
      }, function(result) {

        let buttons = [];
        for (let resp of arr) {
          buttons.push([bot.inlineButton(String(resp.question), {callback: resp.correct})])
        }
        const replyMarkup = bot.inlineKeyboard(buttons, {resize: true});
        // Send message with keyboard markup
        return bot.sendMessage(id, result.translation, {replyMarkup}).then(re => {
          // Start updating message
          console.log("el id del chat ",msg.chat.id)
          lastMessage[msg.chat.id] = [msg.chat.id, re.result.message_id];
        });
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
        console.log("ya hay respuesta,incrementando")
        tmpAnswer.aciertos++;
        await tmpAnswer.save()
      }else {
        console.log("registrando documento de respuestas")
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
        console.log("ya hay respuesta,incrementando")
        tmpAnswer.fallos++;
        await tmpAnswer.save()
      }else {
        console.log("registrando documento de respuestas")
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

};
