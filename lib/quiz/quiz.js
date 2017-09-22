
const Entities = require('html-entities').XmlEntities;
const doRequest = require('../utils/utils').doRequest;
const entities = new Entities();

let lastMessage;

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = function(bot){

  bot.on(['/pregunta'], async (msg) => {
    try {
      const id = msg.from.id;
      const pickOne = getRandomInt(0,49);
      const response = await doRequest('https://opentdb.com/api.php?amount=50&category=11&type=multiple');
      const unaPregunta = JSON.parse(response);
      const respJson = unaPregunta.results[pickOne];
      const arr = [];
      const randomIndex = getRandomInt(0,3);
      for(let i=0;i<respJson.incorrect_answers.length;i++){
        arr.push({question:entities.decode(respJson.incorrect_answers[i],'gbk'), correct:'/false'});
      }
      arr.splice(randomIndex, 0, {question:entities.decode(respJson.correct_answer,'gbk'), correct:'/true'});
      const pregunta = entities.decode(respJson.question,'gbk')+"\n";
      let buttons = [];
      for(let resp of arr){
        buttons.push([bot.inlineButton(String(resp.question), {callback: resp.correct})])
      }
      const replyMarkup = bot.inlineKeyboard(buttons, {resize: true});
      // Send message with keyboard markup
      return bot.sendMessage(id, pregunta, {replyMarkup}).then(re => {
        // Start updating message
        lastMessage = [msg.from.id, re.result.message_id];
      });
    } catch (err) {
      console.error("error en pregunta ",err);
      throw err;
    }
  });

  // Command /hello
  bot.on('/true', msg => {
    console.log('true');

    const [chatId, messageId] = lastMessage;
    const replyMarkup = updateKeyboard("true",msg.from.first_name);
    return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});
  });

  // Command /hello
  bot.on('/false', msg => {
    console.log('false',msg);
    const [chatId, messageId] = lastMessage;
    const replyMarkup = updateKeyboard("false",msg.from.first_name);
    return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});
  });


  // Button callback
  bot.on('callbackQuery', (msg) => {
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
