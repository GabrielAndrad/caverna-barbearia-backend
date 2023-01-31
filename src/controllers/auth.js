const bodyParser = require('body-parser')
const express = require('express')
const moment = require('moment')

const user = require('../models/user')

const router = express.Router()


router.get(`/users`,async (req,res) => {
    try{
      const users = await user.find()
             
      return res.send(users)
    }catch (err) {
      return res.send('Falha ao carregar usuários')
    }
})

router.delete('/user/',async (req,res) => {
  try{
    const users = await user.find()
    
    users.map( async (el) => {
      console.log(el._id)
      await user.findByIdAndDelete(el._id)
    })

    return res.send(users)
  }catch(err){
    return res.send(err.message)
  }
})



router.get('/hasSendMessage',async (req,res) => {
  try{
    const users = await user.find()

    if(req.body.phone){
      let send = false
      users.forEach((el) => {
       if(el.phone === req.body.phone && (moment(el.dateMessage).format('DD/MM/YYYY') === moment(new Date()).format('DD/MM/YYYY'))){
        res.send('true')
        send = true
       } 
      })

      if(!send){
        res.send('false')
      }
    } else {
      res.send('false')
    }
  } catch(err){

  }
})
router.post('/register', async (req,res) => {
  try{
    req.body.dateMessage = new Date()
    const users = await user.find()

    let exists = false

    users.forEach((el) => {
      if(el.phone === req.body.phone){
        exists = true
      }
    })

    if(exists){
      const userId = users.filter(el => el.phone === req.body.phone)[0].id
      await user.findByIdAndUpdate(userId,req.body)
      res.send({user:userId,body:req.body})
    } else {
      const userModel = await user.create(req.body);
      return res.send({ userModel });
    }
  } catch(err){
    console.log(err)
    return res.status(400).send({erro: 'Registration failed edited'})
  }
})

module.exports = app => app.use('/auth',router)