const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')
const path = require('path')
const morgan = require('morgan')

const app = express();


app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(morgan("dev"))

require('./controllers/auth')(app); 

app.get('',(req,res) => {
  res.send('OK')
})

app.use(require("./routes"))

app.listen(4002)

