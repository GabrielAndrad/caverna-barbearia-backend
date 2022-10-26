const mongoose = require('../database')



const scheduleSchema = new mongoose.Schema({
  user: {
    type:{name:'String',phone:'String'},
    require:true
  },
  date: {
    type: 'String',
    required:true,
  },
  hour:{
    type:'String',
    required:true
  },
  dateRegister:{
    type:'String',
    required:true
  },
  typeCut: {
    type:{title:'String',price:'String'},
    required:true
  },

})

const schedule = mongoose.model('schedule',scheduleSchema)

module.exports = schedule