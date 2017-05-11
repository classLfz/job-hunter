// import parser what you have write.
const zlParser = require('./parsers/zhilian-parser.js');
const wyParser = require('./parsers/wuyou-parser.js');

module.exports = {
  // form: sender address
  from: '"<name>" <xxxx@gmai.com>',
  // to: list of receivers
  to: 'xxxx@xx.com, yyyy@yy.com',
  // subject: the title of email
  subject: 'Job hunter',
  // text: which content will exit if there is no html content in email
  text: 'Job List',
  // admin: list of administrator who can get the log information
  admin: 'adming@xx.com',
  // titles: the translated title in email
  titles: {
    zl: '智联招聘',
    wy: '前程无忧'
  },
  // parsers: an object include parser & max page number
  parsers: {
    zl: zlParser,
    wy: wyParser
  },
  // interval: the number of setInterval
  interval: 3600000,
  // keyWords: the key words you wanted
  keyWords: [
    ''
  ],
  email_service: 'gmail',
  email_user: 'xxxx@gmail.com',
  email_pass: 'password',
};