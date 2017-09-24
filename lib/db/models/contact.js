const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;

let contactSchema = new Schema({
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
  stuff  : {
    type    : [String]
  }
});

module.exports = mongoose.model('dealers', contactSchema);