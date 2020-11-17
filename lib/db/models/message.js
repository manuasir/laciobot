const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Mongoose Message Schema
 */
let msgSchema = new Schema({
  msg: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  chatId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('messages', msgSchema)
