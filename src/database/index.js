const process = require("dotenv").config();
const mongoose = require('mongoose')

mongoose.connect(
  process.parsed.MONGO_URL,
  {
    useNewUrlParser: true
  }
);



mongoose.Promise = global.Promise

module.exports = mongoose