const bodyParser = require('body-parser')
const express = require('express')
const moment = require('moment')

const schedule = require('../models/schedule')
const user = require('../models/user')

const router = express.Router()

const hours = [{
  disabled: false,
  value:'08:00:00'
},{
  disabled: false,
  value:'09:00:00'
},{
  disabled: false,
  value:'10:00:00'
},{
  disabled: false,
  value:'11:00:00'
},{
  disabled: false,
  value:'12:00:00'
},{
  disabled: false,
  value:'13:00:00'
},{
  disabled: false,
  value:'14:00:00'
},{
  disabled: false,
  value:'15:00:00'
},{
  disabled: false,
  value:'16:00:00'
},{
  disabled: false,
  value:'17:00:00'
},{
  disabled: false,
  value:'18:00:00'
},{
  disabled: false,
  value:'19:00:00'
}]

router.get('/schedule-hours/:date',async(req,res) => {
  try{
    const schedules = await schedule.find()

    const filterDate = schedules.filter(el => {
      return moment(el.date).format('DD/MM/YYYY') === moment(req.params.date).format('DD/MM/YYYY')
    })

     const setHours = hours.map((hour) => {
       console.log(filterDate[0].hour,hour.value)
      return {
        disabled: filterDate.filter(date => date.hour === hour.value).length > 0,
        value: hour.value
      } 

     })
     return res.send(setHours)
  } catch(err){ 
    return res.send(hours)
  }
})
//return all schedules
router.get('/schedule', async(req,res) => {
  try{
    const schedules = await schedule.find()

    return res.send(schedules)
  } catch(err){
    console.log(err)
    res.status(400).send(err)
  }
})

//return all schedules
router.get('/schedule-by-user/:user', async(req,res) => {
  try{
    const schedules = await schedule.find()
    const userReq = req.params.user
    if(userReq === '12345678912'){
      return res.send(schedules)
    } else {
      const scheduleByUser = schedules.filter(el => {
        return el.user.phone === userReq
      })
      if(scheduleByUser.length > 0){
        return res.send(scheduleByUser)
      } else {
        return res.status(404).send('Não existem agendamento cadastrados para este usuário')
      }
    }
    
  } catch(err){
    console.log(err)
    res.status(400).send(err)
  }
})

router.post('/schedule', async (req,res) => {
  try{
    const scheduleList = await schedule.find()

    const filterSchedule = scheduleList.filter(el => {
      return (req.body.date === el.date) && (req.body.hour === el.hour)
    }) 
    if(filterSchedule.length > 0){
      return res.status(400).send('Já existe um horário agendado para esta data e hora')
    } else {
      const userFilter = scheduleList.filter(el => {
        return req.body.user.phone === el.user.phone
      })
      if(userFilter.length > 0){
        return res.status(400).send('Já existe um horário cadastrado para este telefone')
      } else {
        const scheduleModel = await schedule.create(req.body);
        const userModel = await user.find()
    
        const filterUser = userModel.filter((el) => {
          return el.phone === req.body.user.phone
        })
        if(filterUser.length === 0){
            user.create({
              phone:req.body.user.phone,
              name:req.body.user.name
            })
        }
        return res.send({ scheduleModel });
      }
      

    }
   

  } catch(err){
    console.log('err',err)
    return res.status(400).send(err.message)
  }
})

router.put('/schedule/:id',async (req,res) => {
  try{
    console.log(req.params)
    const userModel = await schedule.findByIdAndUpdate(req.params.id,req.body,{
      returnOriginal: false
    });

    return res.send({ userModel });
  } catch(err) {
    return res.status(400).send(err.message)
  }
})

router.delete('/schedule/:id',async (req,res) => {
  try{
    await schedule.findByIdAndDelete(req.params.id)

    return res.send(`Agenda excluida com sucesso! ${req.params.id}`)
  }catch(err){
    return res.status(404).send(err.message)
  }
})

//return all schedules
router.get('/schedule/:id',async(req,res) => {
  try{
    const schedules = await schedule.findById(req.params.id)
    return res.send(schedules)
  }catch(err){
    return res.send(err.message)

  }
})

module.exports = app => app.use('',router)