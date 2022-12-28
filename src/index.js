require("dotenv").config();

const express = require('express')
const cors = require('cors')
const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

require('./controllers/auth')(app); 
require('./controllers/schedule')(app); 
require('./controllers/holiday')(app);

app.get('',(req,res) => {

  res.send(process.env.MONGO_URL)
})

app.use(require("./routes"))

app.listen(process.env.PORT || 4002, () => {
  console.log("Express server listening on port in mode", process.env.PORT, app.settings.env);
})


