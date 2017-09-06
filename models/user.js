const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;

let userSchema = new Schema({
  username: {
    type    : String,
    required: true,
    unique  : true
  },
  userId  : {
    type    : Number,
    required: true,
    unique  : true
  },
  advices : {
    type   : Number,
    default: 0
  }
});

module.exports = mongoose.model('users', userSchema);