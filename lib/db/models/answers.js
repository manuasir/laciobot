const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Mongoose Answer Schema
 */
let answerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  temas: [{tema: String, aciertos: {type: Number, default: 0}, fallos: {type: Number, default: 0}}]
})

module.exports = mongoose.model('answers', answerSchema)
