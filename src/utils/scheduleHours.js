const moment = require('moment')

// Hardcode do bloqueio total da agenda (inclusive).
// Formato ISO para evitar ambiguidades: YYYY-MM-DD
const BLOCK_UNTIL_ISO = '2025-01-06'

function toIsoDate(date) {
  return moment(date).format('YYYY-MM-DD')
}

function isOnOrBefore(dateA, dateB) {
  // compara somente data (sem horário)
  const a = moment(toIsoDate(dateA), 'YYYY-MM-DD')
  const b = moment(toIsoDate(dateB), 'YYYY-MM-DD')
  return a.isSameOrBefore(b, 'day')
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function minutesToTimeValue(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${pad2(h)}:${pad2(m)}:00`
}

function timeValueToMinutes(value) {
  // "HH:mm:ss" -> minutes
  const [hh, mm] = value.split(':').map(Number)
  return hh * 60 + mm
}

function buildHalfHourSlots({ startValue, endValue, lunchStartValue, lunchEndValue }) {
  const startMin = timeValueToMinutes(startValue)
  const endMin = timeValueToMinutes(endValue)
  const lunchStartMin = lunchStartValue ? timeValueToMinutes(lunchStartValue) : null
  const lunchEndMin = lunchEndValue ? timeValueToMinutes(lunchEndValue) : null

  const slots = []
  for (let t = startMin; t <= endMin; t += 30) {
    const isInLunch =
      lunchStartMin != null &&
      lunchEndMin != null &&
      t >= lunchStartMin &&
      t < lunchEndMin

    if (isInLunch) continue

    slots.push({
      disabled: false,
      value: minutesToTimeValue(t),
      text: null,
    })
  }
  return slots
}

function getWorkingHoursForDate(date) {
  // 0 = domingo ... 6 = sábado
  const day = date.getDay()

  // Domingo fechado
  if (day === 0) return { closed: true }
  // Segunda fechado
  if (day === 1) return { closed: true }

  // Terça a sexta: almoço 12:30 - 14:00
  if (day >= 2 && day <= 5) {
    const lunch = { lunchStartValue: '12:30:00', lunchEndValue: '14:00:00' }

    if (day === 2) return { closed: false, startValue: '09:30:00', endValue: '20:00:00', ...lunch }
    if (day === 3) return { closed: false, startValue: '09:30:00', endValue: '18:00:00', ...lunch }
    if (day === 4) return { closed: false, startValue: '09:30:00', endValue: '19:00:00', ...lunch }
    return { closed: false, startValue: '09:30:00', endValue: '21:00:00', ...lunch } // sexta
  }

  // Sábado: 08:00 - 16:00 sem almoço
  return { closed: false, startValue: '08:00:00', endValue: '16:00:00' }
}

function isBlockedByDate(date) {
  const blockUntil = moment(BLOCK_UNTIL_ISO, 'YYYY-MM-DD').toDate()
  return isOnOrBefore(date, blockUntil)
}

function getHoursSelectedForDate(date) {
  const rule = getWorkingHoursForDate(date)
  if (rule.closed) return []

  const hours = buildHalfHourSlots(rule)

  // Durante o bloqueio total: retorna os slots do dia, mas todos desabilitados.
  if (isBlockedByDate(date)) {
    return hours.map((h) => ({ ...h, disabled: true }))
  }

  return hours
}

module.exports = {
  getHoursSelectedForDate,
  isBlockedByDate,
  BLOCK_UNTIL_ISO,
}


