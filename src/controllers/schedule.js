const bodyParser = require('body-parser')
const express = require('express')
const moment = require('moment')
const apiZap =  `https://api.z-api.io/instances/3B80290D5A60D07A7F1FCE30926D4D6E/token/6CA1C1553951E62A5FFFBFFA/send-messages?cliente`
const schedule = require('../models/schedule')
const user = require('../models/user')
const holiday = require('../models/holiday')
const axios = require('axios')
const router = express.Router()

const hourSabado = [{
  disabled: false,
  value: '08:00:00'
},{
  disabled: false,
  value: '08:30:00'
},
  {
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
  }, {
    disabled: false,
    value: '12:30:00'
  }, {
    disabled: false,
    value: '13:00:00'
  }, {
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
  },{
    disabled: false,
    value: '18:00:00'
  },{
    disabled: false,
    value: '18:30:00'
}]

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
},{
  disabled: false,
  value: '18:00:00'
},{
  disabled: false,
  value: '18:30:00'
},{
  disabled: false,
  value: '19:00:00'
},{
  disabled: false,
  value: '19:30:00'
},{
  disabled: false,
  value: '20:00:00'
},{
  disabled: false,
  value: '20:30:00'
},{
  disabled: true,
  value: '21:00:00'
},{
  disabled: true,
  value: '21:30:00'
},{
  disabled: true,
  value: '22:00:00'
},{
  disabled: true,
  value: '22:30:00'
},{
  disabled: true,
  value: '23:00:00'
},{
  disabled: true,
  value: '23:30:00'
},{
  disabled: true,
  value: '24:00:00'
},{
  disabled: true,
  value: '24:30:00'
}]



router.get('/schedule-hours/:date', async (req, res) => {
  try {
    const schedules = await schedule.find();
    const holidays = await holiday.find();

    const strData = moment(req.params.date).format('DD/MM/YYYY');
    const partesData = strData.split('/');
    const data = new Date(partesData[2], partesData[1] - 1, partesData[0]);

    const isDecember = data.getMonth() === 11; // Dezembro
    const dayOfMonth = data.getDate();
    const dayOfWeek = data.getDay();

    const filterDate = schedules.filter(el =>
      moment(el.date).format('DD/MM/YYYY') === moment(req.params.date).format('DD/MM/YYYY')
    );

    const hoursSelected = dayOfWeek === 6 && dayOfMonth !== 23 ? hourSabado : hours;

    const setHours = hoursSelected.map((hour) => {
      const [hourPart, minutePart] = hour.value.split(':').map(Number); // Extrai hora e minuto
      const hourFmt = hourPart + minutePart / 60; // Formato decimal

      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const isPast = currentHour > hourPart || (currentHour === hourPart && currentMinute >= minutePart);

      const filterDisabled = filterDate.some(date => date.hour === hour.value);

      const holidayDisabled = holidays
        .filter(holiday => moment(holiday.date).format('DD/MM/YYYY') === strData)
        .some(holiday => {
          const [startHour, startMinute] = holiday.inicio.split(':').map(Number);
          const [endHour, endMinute] = holiday.fim.split(':').map(Number);
          const start = startHour + startMinute / 60;
          const end = endHour + endMinute / 60;

          return hourFmt > start && hourFmt < end;
        });

      // Regras específicas para dezembro
      let isDecemberDisabled = hourFmt >= 20; // Por padrão, horários após as 20h são desabilitados

      if (isDecember) {
        if ([17, 18, 19, 20, 21, 23, 26, 27, 28].includes(dayOfMonth) && hourFmt <= 23) {
          isDecemberDisabled = false; // Exceções: Horários até as 23h
        }

        if (dayOfMonth === 22 && hourFmt <= 18) {
          isDecemberDisabled = false; // Exceção: Horários até as 18h
        }

        if (dayOfMonth === 24 && hourFmt <= 12) {
          isDecemberDisabled = false; // Exceção: Horários até as 12h
        }

        if (dayOfMonth === 29 && hourFmt <= 18) {
          isDecemberDisabled = false; // Exceção: Horários até as 18h
        }
      }

      return {
        disabled:
          filterDisabled || // Agendamento já feito
          isPast || // Horário no passado
          holidayDisabled || // Desabilitado por feriado
          hour.disabled || // Padrão de desabilitação
          isDecemberDisabled, // Regras específicas para dezembro
        value: hour.value,
      };
    });

    return res.send(setHours);
  } catch (err) {
    console.error(err);
    return res.status(500).send([]);
  }
});


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

    // if(new Date(req.body.date).getDay() === 0 || new Date(req.body.date).getDay() === 1){
    //   return res.status(400).send('Barbearia fechada se domingo e segunda, favor marcar outro horario!')
    // }

    const filterSchedule = scheduleList.filter(el => {
      return (req.body.date === el.date) && (req.body.hour === el.hour)
    })

    if (filterSchedule.length > 0) {
      return res.status(400).send('Já existe um horário agendado para esta data e hora')
    } else {
    
        const scheduleModel = await schedule.create(req.body);  

        sendMessage(req.body,scheduleModel._id)

        return res.send({scheduleModel});
    }


  } catch (err) {
    console.log('err', err)
    return res.status(400).send(err.message+req.body)
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
    const clientToken = 'F55e38689648f46de9912e392954af021S';

    const id = await schedule.findById(req.params.id)
    await schedule.findByIdAndDelete(req.params.id)
    axios.post('https://api.z-api.io/instances/3B80A4E1B7A6F00663A3CAEDFBA904AE/token/FE1D572D8EF8F335042FBF11/send-messages',
    {
      phone:id.user.phone,
      message:`Olá, ${id.user.name} seu agendamento foi cancelado com sucesso!

Hora: ${id.hour} Data: ${moment(id.date).format('DD/MM/YYYY')}

Qualquer dúvida estou à disposição!`
    },{
      headers: {
        'Client-Token': clientToken,
      },
    })
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

const sendMessage = (data,id) => {
  const clientToken = 'F55e38689648f46de9912e392954af021S';

  axios.post('https://api.z-api.io/instances/3B80A4E1B7A6F00663A3CAEDFBA904AE/token/FE1D572D8EF8F335042FBF11/send-messages',
{
  phone:data.user.phone,
  message:`Olá, ${data.user.name} seu agendamento foi concluído com sucesso!
  
Compareça ao local da barbearia as ${data.hour} da data ${moment(data.date).format('DD/MM/YYYY')}
  
Segue id do agendamento abaixo

Qualquer dúvida estou a disposição!`
},{
  headers: {
    'Client-Token': clientToken,
  },
}).then(response => {
    console.log('mensagem enviada com sucesso!')
    axios.post('https://api.z-api.io/instances/3B80A4E1B7A6F00663A3CAEDFBA904AE/token/FE1D572D8EF8F335042FBF11/send-messages',{
      phone:data.user.phone,
      message:id
    },{
      headers: {
        'Client-Token': clientToken,
      },
    }
    ).then(response => {

    })
}).catch(err => {

})
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
    const schedulesType5 = schedules.filter((el) => el.typeCut.id === 5 || el.typeCut.title === 'Degradê + Barba (1 hora)')
    const schedulesType6 = schedules.filter((el) => el.typeCut.id === 6 || el.typeCut.title === 'Tradicional + Barba (1 hora)')

    const bodyInfo = {
     typeService:{
      total: schedules.length,
      types: {
        Degradê: schedulesType1.length,
        Tradicional: schedulesType2.length,
        Barba: schedulesType3.length, 
        Pézinho: schedulesType4.length,
        'Degradê + Barba':schedulesType5.length,
        'Tradicional + Barba':schedulesType6.length

      }
     },
     priceService: {
      total:(schedulesType1.length*35) + (schedulesType2.length*30) + (schedulesType3.length*30) + (schedulesType4.length*15) + (schedulesType5.length*60) + (schedulesType6.length*60),
      types:{
        Degradê: schedulesType1.length*35,
        Tradicional: schedulesType2.length*30,
        Barba: schedulesType3.length*30,
        Pézinho: schedulesType4.length*15,
        'Degradê + Barba':schedulesType5.length*60,
        'Tradicional + Barba':schedulesType6.length*60
      }
     }
    }
    res.send(bodyInfo)
  } catch(err) {
    return res.send(err.message)
  }
})
module.exports = app => app.use('', router)