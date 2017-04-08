const fs = require('fs');
const logFilePath = './hunter.log';

module.exports = {
  writeLog: writeLog,
  initLog: initLog
};

/**
 * Write log to log file.
 * @param {string} msg log message
 */
function writeLog(msg) {
  let logStr = '';
  try {
    if (fs.existsSync(logFilePath)) {
      logStr = fs.readFileSync(logFilePath).toString();
    }
  } catch (e) {
    console.warn('Read log file error: ', e.message);
  }

  let now = new Date();
  logStr = logStr + '\n' + now + msg;

  try {
    fs.writeFileSync(logFilePath, logStr);
  } catch(e) {
    console.warn('Write log error: ', e.message);
  }
}

/**
 * Initialize log file.
 */
function initLog() {
  try {
    fs.writeFileSync(logFilePath, '');
  } catch(e) {
    console.warn('Init log error: ', e.message);
  }
}