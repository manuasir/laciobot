const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Mongoose User Schema
 */
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: false
  },
  userId: {
    type: String,
    required: true,
    unique: false
  },
  advices: {
    type: Number,
    default: 0,
    unique: false
  }
})

module.exports = mongoose.model('users', userSchema)
