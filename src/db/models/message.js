const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Mongoose Message Schema
 */
const msgSchema = new Schema({
  msg: {
    type: String,
    required: true
  },
  userId: {
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
