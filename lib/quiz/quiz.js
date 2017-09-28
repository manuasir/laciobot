
const Entities = require('html-entities').XmlEntities;
const doRequest = require('../utils/utils').doGetRequest;
const entities = new Entities();
const translate = require('node-google-translate-skidz');
const Answer = require('../db/models/answers');
const User = require('../db/models/user');
let lastMessage = {};
let canAskMulti = {};

module.exports = function(bot){


  /**
   * Devuelve un número random en el rango proporcionado,extremos incluidos.
   * @param min
   * @param max
   * @return {*}
   */
  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Procesa las respuestas de los usuarios
   * @param msg
   * @param acierto
   * @return {Promise.<*|{short, arguments}>}
   */
  const response = async (msg,acierto) => {
    try {
      const [chatId, messageId, category] = lastMessage[msg.message.chat.id];
      const categoryName = category;
      // obtener el ID del usuario en MongoDB
      let tmpP = await User.findOne({userId: msg.from.id});
      if (tmpP) {
        // comprobar si el usuario tiene respuestas creadas
        let tmpAnswer = await Answer.findOne({userId: tmpP._id});
        if (tmpAnswer) {
          // Tiene documento de respuesta
          // buscar si tiene tema registrado
          let isThere = false;
          let index;
          for(let i=0;i<tmpAnswer.temas.length && !isThere;i++) {
            if (tmpAnswer.temas[i].tema === categoryName) {
              index=i;
              isThere = true;
            }
          }
          if(!isThere) {
            if (acierto)
              tmpAnswer.temas.push({tema: categoryName, aciertos: 1});
            else
              tmpAnswer.temas.push({tema: categoryName, fallos: 1});
            await tmpAnswer.save();
          }else{
            if(acierto)
              tmpAnswer.temas[index].aciertos++;
            else
              tmpAnswer.temas[index].fallos++;
            await tmpAnswer.save();
          }
        } else {
          // crear una nueva respuesta
          let newAnswer;
          if (acierto)
            newAnswer = new Answer({userId: tmpP._id, temas: [{tema: categoryName, aciertos: 1}]});
          else
            newAnswer = new Answer({userId: tmpP._id, temas: [{tema: categoryName, fallos: 1}]});
          await newAnswer.save();
        }
      }
      canAskMulti[msg.message.chat.id] = false;
      let failOrOk = (acierto) ? "true" : "false";
      const replyMarkup = updateKeyboard(failOrOk, msg.from.first_name);
      return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});
    }catch(err){
      console.error("error en respuesta");
      throw err;
    }
  };

  /**
   * Actualiza los botones tras contestar.
   * @param answer
   * @param name
   * @return {*|{inline_keyboard}}
   */
  const updateKeyboard = (answer,name) => {
    let str = (answer === 'false') ? 'Fallaste' : 'Acertaste';
    return bot.inlineKeyboard([
      [
        bot.inlineButton(str+' ,'+name,{callback:'nada'})
      ]
    ]);
  }

  /**
   * Traduce preguntas
   * @param arr
   * @param pregunta
   * @return {Promise}
   */
  const traducir = async (arr,pregunta) =>{
    return new Promise(function(resolve,reject){
      translate({
        text: pregunta,
        source: 'en',
        target: 'es'
      }, function (result) {

        let buttons = [];
        for (let resp of arr) {
          buttons.push([bot.inlineButton(String(resp.question), {callback: resp.correct})])
        }
        if(buttons.length===0)
          reject();
        let obj = {buttons:buttons,translation:result.translation}
        resolve(obj)
      });
    });
  };

  /**
   * Construye pregunta y respuestas en un objeto en función de la categoría.
   * @param id
   * @param category
   * @return {Promise}
   */
  const makeQuestion = async (id,category) => {
    try {
      let respLength = await doRequest('https://opentdb.com/api_count.php?category=' + category);
      const theTam = JSON.parse(respLength);
      let tam = (theTam.category_question_count.total_question_count < 50) ? theTam.category_question_count.total_question_count : 50;
      const pickOne = getRandomInt(0, tam);
      console.log(tam)
      const response = await doRequest('https://opentdb.com/api.php?amount='+tam+'&category='+category);
      const unaPregunta = JSON.parse(response);
      const respJson = unaPregunta.results[pickOne];
      if(!respJson || !respJson.incorrect_answers)
        throw {data:'error al procesar'}
      const arr = [];
      const randomIndex = getRandomInt(0, 3);
      for (let i = 0; i < respJson.incorrect_answers.length; i++) {
        arr.push({question: entities.decode(respJson.incorrect_answers[i], 'gbk'), correct: '/false'});
      }
      arr.splice(randomIndex, 0, {question: entities.decode(respJson.correct_answer, 'gbk'), correct: '/true'});
      const pregunta = entities.decode(respJson.question, 'gbk') + "\n";
      let buttons = await traducir(arr,pregunta);

      const replyMarkup = bot.inlineKeyboard(buttons.buttons, {resize: true});
      return {replyMarkup: replyMarkup, question: buttons.translation};
    } catch (err) {
      console.error("error al crear la pregunta")
      throw err;
    }
  };

  /**
   * Devuelve un id
   * @param what
   * @return {number}
   */
  const getCategory = (what) => {
    switch(what){
      case 'cine': return 11;
      case 'tv': return 14;
      case 'musica': return 12;
      case 'libros': return 10;
      case 'historia': return 23;
      case 'videojuegos': return 15;
      case 'arte': return 25;
      case 'juegosmesa': return 16;
      case 'animales': return 27;
      case 'mitologia': return 20;
      case 'naturaleza': return 17;
    }
  }

  /**
   * Clasificación y puntuaciones de los usuarios
   */
  bot.on(['/clasificacion'], async (msg) => {
    try {
      let tmpP = await User.findOne({userId:msg.from.id});
      if (tmpP) {
        let tmpAnswer = await Answer.findOne({userId:tmpP._id});
        let cadena="Puntuación de "+tmpP.username+'\n';
        if(!tmpAnswer || !tmpAnswer.temas || tmpAnswer.temas.length<1)
          return msg.reply.text('Aún no tienes puntuaciones,no seas lacio y juega más');

        for(let i=0;i<tmpAnswer.temas.length;i++){
          cadena+='---------------\n'+
            tmpAnswer.temas[i].tema+'\n'+
            'Aciertos: '+tmpAnswer.temas[i].aciertos+'\n'+
            'Fallos: '+tmpAnswer.temas[i].fallos+'\n';
        }

        return msg.reply.text(cadena);
      }
    } catch (err) {
      throw err;
    }
  });

  /**
   * Evento al recibir petición de pregunta con parámetros
   */
  bot.on([/^\/pregunta$/], async (msg) => {
    return msg.reply.text('Uso:\n/pregunta + \n[cine,tv,musica,libros,historia\nvideojuegos,arte,juegosmesa,animales\nnaturaleza,mitologia]');
  });

  /**
   * Evento al recibir petición de pregunta con parámetros
   */
  bot.on([/^\/pregunta (.+)$/], async (msg,props) => {
    try {
      const id = msg.chat.id;
      const what = props.match[1];
      if(!['cine','tv','musica','libros','historia','videojuegos','arte','juegosmesa','animales'
          ,'naturaleza','mitologia'].includes(what))
        return bot.sendMessage(id, 'Temas disponibles:\n' +
          '[cine,tv,musica,libros,historia\\nvideojuegos,arte,juegosmesa,animales\\nnaturaleza,mitologia]\\');

      let category = getCategory(what);
      if(canAskMulti[id])
        return bot.sendMessage(msg.chat.id, 'Hay preguntas pendientes');
      canAskMulti[id]=true;
      const result = await makeQuestion(id,category);
      let replyMarkup = result.replyMarkup;
      return bot.sendMessage(id, result.question, {replyMarkup}).then(re => {
        lastMessage[msg.chat.id] = [msg.chat.id, re.result.message_id, what];
      });
    } catch (err) {
      canAskMulti[msg.chat.id]=false;
      bot.sendMessage(msg.chat.id, 'Hubo error al procesar')
      console.error("error en pregunta");
      throw err;
    }
  });

  /**
   * Si pregunta acertada
   */
  bot.on('/true', async msg => {
    await response(msg,true);
  });

  /**
   * Si pregunta fallada
   */
  bot.on('/false', async msg => {
    await response(msg,false)
  });

  /**
   * Redirecciona al evento que se pasa por callback
   */
  bot.on('callbackQuery', (msg) => {
    return bot.answerCallbackQuery(msg.id);
  });

};
