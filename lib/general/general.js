const Word       = require('../db/models/word');
const User       = require('../db/models/user');

module.exports = function(bot){

  /**
   * Recibe y registra un mensaje
   */
  bot.on('text', async (msg) => {
    try {
      let u = await User.findOne({username: msg.from.username});
      if (!u) {
        u = new User({username: msg.from.username, userId: msg.from.id});
        await u.save();
        msg.reply.text('Laci@ @' + msg.from.username + ', encantado.');
      }
      let palabras = msg.text.split(' ');
      for (let palabra of palabras) {
        if (!(palabra.includes('/')) && palabra.length >= 3 &&
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
      let user = new User({
        username: msg.new_chat_member.username,
        userId  : msg.new_chat_member.id
      });
      await user.save();
      msg.reply.text('Ha entrado un nuevo laci@ en el grupo');
    } catch (err) {
      if (err.code === 11000) {
        let u     = await User.findOne({username: msg.new_chat_member.username});
        await u.save();
        msg.reply.text('Ha entrado un viejo lacio de nuevo');
      } else {
        throw err;
      }
    }
  });

};