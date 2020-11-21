const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Mongoose User Schema
 */
const questionSchema = new Schema({

  userId: {
    type: String,
    required: true,
    unique: false

  },
  category: {
    type: String,
    required: true,
    unique: false

  },
  result: {
    type: String,
    required: true,
    unique: false

  },
  chatId: {
    type: String,
    required: true,
    unique: false
  }
})

module.exports = mongoose.model('questions', questionSchema)
