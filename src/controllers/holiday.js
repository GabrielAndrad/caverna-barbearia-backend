const bodyParser = require('body-parser')
const express = require('express')
const moment = require('moment')

const holiday = require('../models/holiday')

const router = express.Router()

router.post('/holiday',async (req,res) => {
  try{
    const body = req.body

    body.dateRegister = moment(new Date()).format('DD/MM/YYYY')
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

router.delete('/holiday/:id',async (req,res) => {
  try {
    await holiday.findByIdAndDelete(req.params.id)
    
    return res.send(`Feríado excluido com sucesso! ${req.params.id}`)
  } catch(err) {
    res.send(err.message)
  }
})

module.exports = app => app.use('', router)