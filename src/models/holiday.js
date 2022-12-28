const mongoose = require('../database')



const holidaySchema = new mongoose.Schema({
  date: {
    type: 'String',
    required:true,
  },
  inicio:{
    type:'String',
    required:true
  },
  dateRegister:{
    type:'String',
    required:true
  },
  fim:{
    type:'String',
    required:true
  }

})

const holiday = mongoose.model('holiday',holidaySchema)

module.exports = holiday