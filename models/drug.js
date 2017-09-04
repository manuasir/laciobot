const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;

let drugSchema = new Schema({
  drug: {
    type    : String,
    required: true,
    unique  : true
  }

});

module.exports = mongoose.model('drugs', drugSchema);