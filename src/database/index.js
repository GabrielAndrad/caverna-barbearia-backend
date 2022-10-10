const { default: mongoose } = require('mongoose')
const moongoose = require('mongoose')

moongoose.connect('mongodb://localhost/noderest')

// mongodb+srv://projeto-barbearia:<password>@cluster0.du6dlj3.mongodb.net/?retryWrites=true&w=majority

mongoose.Promise = global.Promise

module.exports = mongoose