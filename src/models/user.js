const mongoose = require('../database')

const userSchema = new mongoose.Schema({
  name: {
    type:'String',
    require:true
  },
  phone: {
    type: 'String',
    required:true,
  },
  dateMessage: {
    type: 'String',
    required: true
  }
})

const user = mongoose.model('user',userSchema)

module.exports = user