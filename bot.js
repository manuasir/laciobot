const TelegramBot = require('telebot');
const mongoose   = require('mongoose');
const User       = require('./models/user');
const Word       = require('./models/word');
const Contact       = require('./models/contact');
//const config     = require('./config');
const _          = require('lodash');

// MongoDB connection
mongoose.connect('mongodb://manuasir:mongodb@ds147072.mlab.com:47072/heroku_mctx4f0c');
mongoose.Promise = global.Promise;

console.log("env ",process.env.TOKEN);
const token = process.env.TOKEN;
const bot = new TelegramBot(token);

/**
 * Saludo
 */
bot.on(['/start', '/hola'], (msg) => {
    msg.reply.text('Hola '+ msg.from.username);
});

/**
 * Recibe un mensaje
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

/**
 * Lista de contactos
 */
bot.on(['/pillar'], async (msg) => {
    try {
        let dealers = await Contact.find({}).sort('-amount').exec();
        if(dealers.length<1)
            msg.reply.text('⌨ No hay contactos todavía, puedes añadir con el comando /nuevocontacto [nombre] [telefono] [qué tiene]. '+"\n"+'Ej: /nuevocontacto tatin 612487956 widow')
        else{
            let str = "";
            for(let i=0;i<dealers.length;i++){
                str+="-----------"+parseInt(i+1)+"----------"+"\n";
                str+="⌨️ nombre: "+dealers[i].name+"\n";
                str+="☎️ tlf: "+dealers[i].tlf+"\n";
                str+="✅ qué tiene: "+ _.join(dealers[i].drug)+"\n";
            }
            msg.reply.text(str)
        }
        return 0;
    } catch (err) {
        throw err;
    }
});

/**
 * Añadir nuevo camello
 */
bot.on(['/nuevocontacto'], async (msg) => {
    try {

        if(msg.text.split(" ").length < 4){
            msg.reply.text('Faltan datos')
            return 0
        }
        let str = []
        let splittedArray = msg.text.split(" ");
        for(let i=3;i<splittedArray.length;i++)
            str.push(splittedArray[i])
        const newDealer = new Contact({name:splittedArray[1]
            ,tlf:splittedArray[2]
            ,drug:str});
        await newDealer.save();
        msg.reply.text("Guardado con éxito! ✍️");
    } catch (err) {
        throw err;
    }
});

/**
 * Recibe un sticker y contesta con otro
 */
bot.on('sticker', (msg) => {
    return msg.reply.sticker('http://i.imgur.com/VRYdhuD.png', { asReply: true });
});

/**
 * Inicia el bot
 */
bot.start();