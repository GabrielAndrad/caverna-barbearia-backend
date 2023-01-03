const bodyParser = require('body-parser')
const express = require('express')
const moment = require('moment')

const schedule = require('../models/schedule')
const user = require('../models/user')
const holiday = require('../models/holiday')

const router = express.Router()

const hours = [{
  disabled: false,
  value: '09:00:00'
},{
  disabled: false,
  value: '09:30:00'
},{
  disabled: false,
  value: '10:00:00'
},{
  disabled: false,
  value: '10:30:00'
},{
  disabled: false,
  value: '11:00:00'
},{
  disabled: false,
  value: '11:30:00'
}, {
  disabled: false,
  value: '12:00:00'
},{
  disabled: false,
  value: '12:30:00'
}, {
  disabled: false,
  value: '13:00:00'
},{
  disabled: false,
  value: '13:30:00'
},{
  disabled: false,
  value: '14:00:00'
},{
  disabled: false,
  value: '14:30:00'
}, {
  disabled: false,
  value: '15:00:00'
},{
  disabled: false,
  value: '15:30:00'
}, {
  disabled: false,
  value: '16:00:00'
},{
  disabled: false,
  value: '16:30:00'
}, {
  disabled: false,
  value: '17:00:00'
},{
  disabled: false,
  value: '17:30:00'
}]

router.get('/schedule-hours/:date', async (req, res) => {
  try {
    const schedules = await schedule.find()
    console.log(req,schedules)
    var strData = moment(req.params.date).format('DD/MM/YYYY')
    var partesData = strData.split("/");
    var data = new Date(partesData[2], partesData[1] - 1, partesData[0]);
    
    const filterDate = schedules.filter(el => {
      return moment(el.date).format('DD/MM/YYYY') === moment(req.params.date).format('DD/MM/YYYY')
    })
    const holidays = await holiday.find()

    const setHours = hours.map((hour,index) => {
      
      const sum = new Date().getHours() >= +hour.value.split(':')[0]
      const hourSum = new Date().getHours() === +hour.value.split(':')[0]? new Date().getMinutes() >= +hour.value.split(':')[1] :true
      const filterDisabled = filterDate.filter(date => date.hour === hour.value)
      const time = index !== 0 ? filterDate.filter(date => hours[index-1].value === date.hour):[]
      const date = index !== 0? filterDate.filter(date => hours[index-1].value === date.hour).length > 0?
      filterDate.filter(date => hours[index-1].value === date.hour)[0].typeCut.time:0:0

      let holidayDisabled = {inicio:0,fim:0}
      if(holidays.map((res) => moment(res.date).format('DD/MM/YYYY')).includes(strData)){
        holidays.forEach((el) => {
          let inicio = +(el.inicio.split(':')[0]+'.'+el.inicio.split(':')[1])
          let fim = +(el.fim.split(':')[0]+'.'+el.fim.split(':')[1])
          if(moment(el.date).format('DD/MM/YYYY') === strData){
            holidayDisabled = {
              inicio:
              inicio < holidayDisabled.inicio || inicio === 0?inicio:holidayDisabled.inicio,
              fim:
              fim > holidayDisabled.fim?fim:holidayDisabled.fim}
          }
        })
      }
   
      const hourFmt = +(hour.value.split(':')[0]+'.'+hour.value.split(':')[1])
      console.log()
      return {
        disabled: 
        filterDisabled.length > 0 || 
        (date === 2 && time.length > 0) || 
        (new Date() > data && sum && hourSum) ||
         ((holidayDisabled) && hourFmt > holidayDisabled.inicio && hourFmt < holidayDisabled.fim)
        ,
        value: hour.value
      }

    })
    return res.send(setHours)
  } catch (err) {
    console.log(err)
    return res.send([])
  }
})
//return all schedules
router.get('/schedule', async (req, res) => {
  try {
    const schedules = await schedule.find()

    return res.send(schedules)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//return all schedules
router.get('/schedules-by-user/:user', async (req, res) => {
  try {
    const schedules = await schedule.find()
    const userReq = req.params.user
    const filters = req.query
    if (userReq === '(12)34567-8910') {
      if (filters) {
        return res.send(schedules.map((el) => {
          el.date = moment(el.date).format('DD/MM/YYYY')
          return el
        }).filter((filt) => {
          if (filters.search) {
            return (filt.user.name.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
              || filt.user.phone.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
              || filt.typeCut.title.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
              || filt.typeCut.price.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, "")))
              || filt.id.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
          } else {
            return true
          }

        }).filter(filt2 => {
          if (filters.inicio) {
            const dateFormat = filt2.date.split('/')
            const date = new Date(dateFormat[2] + '-' + dateFormat[1] + '-' + dateFormat[0]).getTime()

            return (
              date >= new Date(filters.inicio).getTime()
              && date <= new Date(filters.fim).getTime()
            )
          } else {
            return true
          }

        })
        )
      } else {
        return res.send(schedules.map((el) => {
          el.date = moment(el.date).format('DD/MM/YYYY')
          return el
        }))
      }
      return
    } else {
      const scheduleByUser = schedules.filter(el => {
        return el.user.phone === userReq
      }).map((el) => {
        el.date = moment(el.date).format('DD/MM/YYYY')
        return el
      })
      if (scheduleByUser.length > 0) {
        return res.send(scheduleByUser)
      } else {
        return res.status(404).send('Não existem agendamento cadastrados para este usuário')
      }
    }

  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

router.get('/schedules-by-id/:id', async (req, res) => {
  try {
    const schedules = await schedule.find()
    const userReq = req.params.id
    const filters = req.query
    if (userReq === '12345678910') {
      if (filters) {
        return res.send(schedules.map((el) => {
          el.date = moment(el.date).format('DD/MM/YYYY')
          return el
        }).filter((filt) => {
          if (filters.search) {
            return (filt.user.name.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
              || filt.user.phone.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
              || filt.typeCut.title.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
              || filt.typeCut.price.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, "")))
          || filt.id.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
          } else {
            return true
          }

        }).filter(filt2 => {
          if (filters.inicio) {
            const dateFormat = filt2.date.split('/')
            const date = new Date(dateFormat[2] + '-' + dateFormat[1] + '-' + dateFormat[0]).getTime()

            return (
              date >= new Date(filters.inicio).getTime()
              && date <= new Date(filters.fim).getTime()
            )
          } else {
            return true
          }

        })
        )
      } else {
        return res.send(schedules.map((el) => {
          el.date = moment(el.date).format('DD/MM/YYYY')
          return el
        }))
      }
    } else {
      const scheduleByUser = schedules.filter(el => {
        return el.id === userReq
      }).map((el) => {
        el.date = moment(el.date).format('DD/MM/YYYY')
        return el
      })
      if (scheduleByUser.length > 0) {
        return res.send(scheduleByUser)
      } else {
        return res.status(404).send('Não existem agendamento cadastrados para este usuário')
      }
    }

  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

router.post('/schedule', async (req, res) => {
  try {
    const scheduleList = await schedule.find()

    const filterSchedule = scheduleList.filter(el => {
      return (req.body.date === el.date) && (req.body.hour === el.hour)
    })
    if (filterSchedule.length > 0) {
      return res.status(400).send('Já existe um horário agendado para esta data e hora')
    } else {
      const userFilter = scheduleList.filter(el => {
        return req.body.user.phone === el.user.phone
      })
      if (userFilter.length > 0 && new Date(req.body.date) > new Date()) {
        return res.status(400).send('Já existe um horário cadastrado para este telefone')
      } else {
        const scheduleModel = await schedule.create(req.body);  
        const userModel = await user.find()

        // const filterUser = userModel.filter((el) => {
        //   return el.phone === req.body.user.phone
        // })
        // if (filterUser.length === 0) {
        //   user.create({
        //     phone: req.body.user.phone,
        //     name: req.body.user.name
        //   })
        // }

        sendMessage(`SEU CÓDIGO DE AGENDAMENTO É ${scheduleModel._id}`, '')

        return res.send({ scheduleModel });
      }


    }


  } catch (err) {
    console.log('err', err)
    return res.status(400).send(err.message)
  }
})

router.put('/schedule/:id', async (req, res) => {
  try {
    const userModel = await schedule.findByIdAndUpdate(req.params.id, req.body, {
      returnOriginal: false
    });

    return res.send({ userModel });
  } catch (err) {
    return res.status(400).send(err.message)
  }
})

router.delete('/schedule/:id', async (req, res) => {
  try {
    await schedule.findByIdAndDelete(req.params.id)

    return res.send(`Agenda excluida com sucesso! ${req.params.id}`)
  } catch (err) {
    return res.status(404).send(err.message)
  }
})

//return all schedules
router.get('/schedule/:id', async (req, res) => {
  try {
    const schedules = await schedule.findById(req.params.id)
    return res.send(schedules)
  } catch (err) {
    return res.send(err.message)

  }
})

const sendMessage = (message, phone) => {
  const phoneFormat = 'whatsapp:+55' + phone?phone.replace('-', '').replace('(', '').replace(')', ''):'991891072'
  require('dotenv');
  const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_TOKEN); ``
  client.messages.create({
    from: 'whatsapp:+14155238886',
    body: message,
    to: 'whatsapp:+5515991891072'
  }).then(message => console.log(message.sid))
}




router.get('/infos',async (req,res) => {
  try{
    const filters = req.query
    let schedules = await schedule.find()
    if(filters){
       schedules = schedules.map((el) => {
        el.date = moment(el.date).format('DD/MM/YYYY')
        return el
      }).filter((filt) => {
        if (filters.search) {
          return (filt.user.name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
            || filt.user.phone.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
            || filt.typeCut.title.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
            || filt.typeCut.price.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")))
            || filt.id.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.search.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
        } else {
          return true
        }
  
      }).filter(filt2 => {
        if (filters.inicio) {
          const dateFormat = filt2.date.split('/')
          const date = new Date(dateFormat[2] + '-' + dateFormat[1] + '-' + dateFormat[0]).getTime()
  
          return (
            date >= new Date(filters.inicio).getTime()
            && date <= new Date(filters.fim).getTime()
          )
        } else {
          return true
        }
  
      })
    }
   
    const schedulesType1 =  schedules.filter((el) => el.typeCut.id === 1 || el.typeCut.title === 'Degradê (1 hora)')
    const schedulesType2 = schedules.filter((el) => el.typeCut.id === 2 || el.typeCut.title === 'Tradicional (30 min)')
    const schedulesType3 = schedules.filter((el) => el.typeCut.id === 3 || el.typeCut.title === 'Barba (30 min)')
    const schedulesType4 = schedules.filter((el) => el.typeCut.id === 4 || el.typeCut.title === 'Pezinho (30 min)')
    
    const bodyInfo = {
     typeService:{
      total: schedules.length,
      types: {
        Degradê: schedulesType1.length,
        Tradicional: schedulesType2.length,
        Barba: schedulesType3.length, 
        Pézinho: schedulesType4.length
      }
     },
     priceService: {
      total:(schedulesType1.length*30) + (schedulesType2.length*25) + (schedulesType3.length*20) + (schedulesType4.length*10),
      types:{
        Degradê: schedulesType1.length*30,
        Tradicional: schedulesType2.length*25,
        Barba: schedulesType3.length*20,
        Pézinho: schedulesType4.length*10
      }
     }
    }
    res.send(bodyInfo)
  } catch(err) {
    return res.send(err.message)
  }
})
module.exports = app => app.use('', router)