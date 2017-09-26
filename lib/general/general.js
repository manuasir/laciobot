const Word       = require('../db/models/word');
const User       = require('../db/models/user');

module.exports = function(bot){

  /**
   * Recibe y registra un mensaje
   */
  bot.on('text', async (msg) => {
    try {
      console.log('el msg',msg)
      let username = msg.from.username || msg.from.first_name;
      let u = await User.findOne({username: username});
      if (!u) {
        console.log("creando nuevo usuario ",msg)
        u = new User({username: username, userId: msg.from.id});
        await u.save();
        msg.reply.text('Laci@ @' + username + ', encantado.');
      }
      let usuariotemporal = await User.findOne({username:username})
      console.log("usuario ya existe ",usuariotemporal)

      let palabras = msg.text.split(' ');
      for (let palabra of palabras) {
        if (!(palabra.includes('/')) && palabra.length > 3 &&
          !['con','mas','eso','esto',
            'del','las','los','por','para',
            'que', 'qué', 'cómo', 'donde',
            'cuando', 'cuándo','hay','este'].includes(palabra)) {
          let tmpP = await Word.findOne({word: palabra});
          if (tmpP) {
            tmpP.amount++;
          } else {
            tmpP = new Word({word: palabra});
          }
          await tmpP.save();
        }
      }
      return 0;
    } catch (err) {
      throw err;
    }
  });

  /**
   * Ranking de palabras
   */
  bot.on(['/ranking'], async (msg) => {
    try {
      let palabras = await Word.find({}).sort('-amount').exec();
      if (palabras.length >= 3) {
        msg.reply.text(
          palabras[0].word +
          ' (' + palabras[0].amount + ' veces), '
          + palabras[1].word
          + '(' + palabras[1].amount + ' veces), '
          + palabras[2].word
          + '(' + palabras[2].amount + ' veces)'
        );
      } else if (palabras.length === 2) {
        msg.reply.text(
          palabras[0].word +
          ' (' + palabras[0].amount + ' veces), ' +
          palabras[1].word +
          '(' + palabras[1].amount + ' veces)'
        );
      } else if (palabras.length === 1) {
        msg.reply.text(
          palabras[0].word +
          ' (' + palabras[0].amount + ' veces)'
        );
      } else {
        msg.reply.text('Hablad más, lacios');
      }
      return 0;
    } catch (err) {
      throw err;
    }
  });

  /**
   * Nuevo usuario en el chat
   */
  bot.on(['newChatMembers'], async (msg) => {
    try {
      let username = msg.new_chat_member.username.toLowerCase();

      let user = new User({
        username: username,
        userId  : msg.new_chat_member.id
      });
      await user.save();
      msg.reply.text('Ha entrado un nuevo laci@ en el grupo');
    } catch (err) {
      if (err.code === 11000) {
        let u     = await User.findOne({username: username});
        await u.save();
        msg.reply.text('Ha entrado un viejo lacio de nuevo');
      } else {
        throw err;
      }
    }
  });

  /**
   * Al editar un mensaje
   */
  bot.on('edit', (msg) => {
    return msg.reply.text('Te he pillado editando el mensaje.', { asReply: true });
  });

  /**
   * Al reconectar
   */
  bot.on(['reconnected'], async (msg) => {

      let user = new User({
        username: msg.new_chat_member.username,
        userId  : msg.new_chat_member.id
      });
      await user.save();
      msg.reply.text('Ha entrado un nuevo laci@ en el grupo');

      if (err.code === 11000) {
        let u     = await User.findOne({username: msg.new_chat_member.username});
        await u.save();
        msg.reply.text('Ha entrado un viejo lacio de nuevo');
      } else {
        throw err;
      }

  });

};