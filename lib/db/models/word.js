const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;

/**
 * Mongoose Word Schema
 */
let wordSchema = new Schema({
  word: {
    type    : String,
    required: true,
    unique  : true
  },
  amount  : {
    type   : Number,
    default: 1
  }
});

module.exports = mongoose.model('words', wordSchema);