var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

var savedSchema = new Schema({
  title: String,
  authors: String,
  rating: Number,
  publisher: String,
  publishedDate: String,
  description: String,
  thumbnail: String,
  price: Number,
  purchase: String
});

module.exports = mongoose.model("Saved", savedSchema);