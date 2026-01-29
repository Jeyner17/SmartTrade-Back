const { addDays, addWeeks, addMonths, setHours, setMinutes, setSeconds } = require('date-fns');
const { BACKUP_FREQUENCIES } = require('../shared/constants/settings.constants');

/**
 * Utilidad para manejo de fechas
 * Sprint 1 - Configuración del Sistema
 */

/**
 * Calcular la próxima fecha de backup
 * @param {string} frequency - Frecuencia del backup (daily, weekly, monthly)
 * @param {string} time - Hora del backup en formato HH:mm
 * @param {Date} fromDate - Fecha desde la cual calcular (por defecto: ahora)
 * @returns {Date} Próxima fecha de backup
 */
const calculateNextBackup = (frequency, time, fromDate = new Date()) => {
  // Parsear la hora (formato: "02:00")
  const [hours, minutes] = time.split(':').map(Number);
  
  // Crear fecha base con la hora configurada
  let nextBackup = setSeconds(setMinutes(setHours(new Date(fromDate), hours), minutes), 0);
  
  // Si la hora ya pasó hoy, empezar desde mañana
  if (nextBackup <= fromDate) {
    nextBackup = addDays(nextBackup, 1);
  }
  
  // No ajustar más si es diario
  if (frequency === BACKUP_FREQUENCIES.DAILY) {
    return nextBackup;
  }
  
  // Si es semanal, asegurarse que sea el próximo lunes
  if (frequency === BACKUP_FREQUENCIES.WEEKLY) {
    const dayOfWeek = nextBackup.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    return addDays(nextBackup, daysUntilMonday);
  }
  
  // Si es mensual, programar para el primer día del próximo mes
  if (frequency === BACKUP_FREQUENCIES.MONTHLY) {
    return addMonths(setHours(setMinutes(new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 1), minutes), hours), 0);
  }
  
  return nextBackup;
};

/**
 * Formatear fecha según el formato configurado
 * @param {Date} date - Fecha a formatear
 * @param {string} format - Formato deseado (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
 * @returns {string} Fecha formateada
 */
const formatDate = (date, format = 'DD/MM/YYYY') => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Formatear hora según el formato configurado
 * @param {Date} date - Fecha/hora a formatear
 * @param {string} format - Formato deseado (12h, 24h)
 * @returns {string} Hora formateada
 */
const formatTime = (date, format = '24h') => {
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  if (format === '12h') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

/**
 * Validar formato de hora
 * @param {string} time - Hora en formato HH:mm
 * @returns {boolean}
 */
const isValidTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

module.exports = {
  calculateNextBackup,
  formatDate,
  formatTime,
  isValidTimeFormat
};