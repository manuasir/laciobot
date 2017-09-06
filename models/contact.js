const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;

let dealerSchema = new Schema({
  name: {
    type    : String,
    required: true,
    unique  : true
  },
  tlf: {
    type    : String,
    required: true,
    unique  : true
  },
  drug  : {
    type    : [String]
  }
});

module.exports = mongoose.model('dealers', dealerSchema);