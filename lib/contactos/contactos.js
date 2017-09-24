const Contact       = require('../db/models/contact');


module.exports = function(bot){

  /**
   * Lista de contactos
   */
  bot.on(['/contactos'], async (msg) => {
    try {
      let dealers = await Contact.find({}).sort('-amount').exec();
      if(dealers.length<1)
        msg.reply.text('⌨ No hay contactos todavía, puedes añadir con el comando /nuevocontacto [nombre] [telefono] [qué tiene]. '+"\n"+'Ej: /nuevocontacto tatin 612487956 widow')
      else{
        let str = "";
        for(let i=0;i<dealers.length;i++){
          console.log(dealers[i])
          str+="-----------"+parseInt(i+1)+"----------"+"\n";
          str+="⌨️ nombre: "+dealers[i].name+"\n";
          str+="☎️ tlf: "+dealers[i].tlf+"\n";
          str+="✅ qué tiene: "+ dealers[i].stuff.join()+"\n";
        }
        msg.reply.text(str)
      }
      return 0;
    } catch (err) {
      throw err;
    }
  });

  /**
   * Añadir nuevo contacto
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
        ,stuff:str});
      await newDealer.save();
      msg.reply.text("Guardado con éxito! ✍️");
    } catch (err) {
      throw err;
    }
  });

};
