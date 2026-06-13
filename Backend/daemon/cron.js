const cron = require('node-cron');
const { runDaemon } = require('./imap');

// Ejecutar inmediatamente al iniciar
runDaemon();

// Ejecuta cada 5 minutos
cron.schedule('*/30 * * * * *', () => {
  console.log('Ejecutando daemon IMAP...');
  runDaemon();
});

module.exports = { runDaemon };