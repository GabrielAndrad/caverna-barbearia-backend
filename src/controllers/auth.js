const bodyParser = require('body-parser')
const express = require('express')


const user = require('../models/user')

const router = express.Router()


router.get(`/users`,async (req,res) => {
    try{
      const users = await user.find()
      return res.send({users})
    }catch (err) {
      return res.send('Falha ao carregar usuários')
    }
})
router.post('/register', async (req,res) => {
  try{
    const userModel = await user.create(req.body);

    return res.send({ userModel });
  } catch(err){
    console.log(err)
    return res.status(400).send({erro: 'Registration failed edited'})
  }
})

module.exports = app => app.use('/auth',router)