
const Entities = require('html-entities').XmlEntities;
const doRequest = require('../utils/utils').doRequest;
const entities = new Entities();
const _ = require('lodash');
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
      console.log(respJson);
      for(let i=0;i<respJson.incorrect_answers.length;i++){
        arr.push({question:respJson.incorrect_answers[i],correct:false});
        console.log(respJson.incorrect_answers[i])
      }
      arr.splice(randomIndex, 0, {question:respJson.correct_answer, correct:true});
      const pregunta = entities.decode(respJson.question,'gbk')+":\n";
      let buttons = [];
      for(let resp of arr){
        buttons.push([bot.inlineButton(String(resp.question), {callback: 'correct'})])
      }
      const replyMarkup = bot.inlineKeyboard(buttons, {resize: true});
      // Send message with keyboard markup
      return bot.sendMessage(id, pregunta, {replyMarkup});
    } catch (err) {
      console.error("error en pregunta ",err);
      throw err;
    }
  });

  // Button callback
  bot.on('callbackQuery', (msg) => {

    console.log('callbackQuery data:', msg.data);
    bot.answerCallbackQuery(msg.id);

  });
};
