const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Mongoose Message Schema
 */
const msgSchema = new Schema({
  msg: {
    type: String,
    required: true,
    unique: false
  },
  userId: {
    type: String,
    required: true,
    unique: false
  },
  chatId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
    unique: false
  }
})

module.exports = mongoose.model('messages', msgSchema)
