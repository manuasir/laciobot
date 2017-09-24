
const Entities = require('html-entities').XmlEntities;
const doRequest = require('../utils/utils').doRequest;
const entities = new Entities();
const translate = require('node-google-translate-skidz');
let lastMessage = {};
let canAskMulti = {};
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = function(bot){

  bot.on(['/pregunta'], async (msg) => {
    try {

      if(canAskMulti[msg.chat.id])
        return bot.sendMessage(msg.chat.id, 'Hay preguntas pendientes');
      //canAsk = false;
      const id = msg.chat.id;
      canAskMulti[id]=true;
      console.log("chat ",id+" incrementado en uno ",canAskMulti[id])
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
        console.log(result);

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
  bot.on('/true', msg => {
    console.log('true el msg ',msg, " el id del chat ",msg.message.chat.id)
    canAskMulti[msg.message.chat.id]=false;

    const [chatId, messageId] = lastMessage[msg.message.chat.id];
    const replyMarkup = updateKeyboard("true",msg.from.first_name);
    return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});
  });

  // Command /hello
  bot.on('/false', msg => {
    console.log('false el msg ',msg+ " el id del chat ",msg.message.chat.id)

    canAskMulti[msg.message.chat.id]=false;

    const [chatId, messageId] = lastMessage[msg.message.chat.id];
    const replyMarkup = updateKeyboard("false",msg.from.first_name);
    return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});
  });


  // Button callback
  bot.on('callbackQuery', (msg) => {
    console.log("devolviendo el msg",msg)
    return bot.answerCallbackQuery(msg.id);
  });

  const updateKeyboard = (answer,name) => {
    let str = (answer === 'false') ? 'incorrectamente' : 'correctamente';
    return bot.inlineKeyboard([
      [
        bot.inlineButton('Respondida '+str+' por '+name,{callback:'nada'})
      ]
    ]);
  }

};
