const hunter = require('./hunter.js');
const logger = require('./logger.js');
const interval = require('./config.js').interval;

// First time to hunt.
hunter.hunting();
hunter.reporter();
logger.initLog();

// set interval.
setInterval(function() {
  hunter.hunting();
  hunter.reporter();
  logger.initLog();
}, interval);