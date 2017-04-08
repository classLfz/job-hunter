const nodemailer = require('nodemailer');
const config = require('./config.js');
const logger = require('./logger.js');

let transporter = nodemailer.createTransport({
  service: config.email_service,
  auth: {
    user: config.email_user,
    pass: config.email_pass
  }
});

/**
 * Send email by nodemailer. If error happened that will write log.
 * @param {object} mailOptions email options
 */
function sendMail(mailOptions) {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.writeLog(error);
      return console.log(error);
    }
    logger.writeLog(`Message ${info.messageId} sent ${info.response}`);
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

module.exports = {
  sendMail: sendMail
};