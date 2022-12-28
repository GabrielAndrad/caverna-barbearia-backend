const bodyParser = require('body-parser')
const express = require('express')
const moment = require('moment')

const holiday = require('../models/holiday')

const router = express.Router()

router.post('/holiday',async (req,res) => {
  try{
    const body = req.body

    body.dateRegister = moment(new Date()).format('DD/MM/YYYY')
    console.log(holiday,body)
    const holidayCreate = await holiday.create(body)
    res.send(holidayCreate)
  } catch(err){
    res.send(err.message)
  }
 
})

router.get('/holiday',async (req,res) => {
  try{  
    const holidays = await holiday.find()

    res.send(holidays)
  } catch(err){
    res.send(err.message)
  }
})

module.exports = app => app.use('', router)