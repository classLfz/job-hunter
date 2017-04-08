const axios = require('axios');
const fs = require('fs');
const spider = require('./spider.js');
const emailer = require('./emailer.js');
const logger = require('./logger.js');

const logFilePath = './hunter.log';

// exit company name list
let jobList = [];

// config
const config = require('./config.js');
let keyWords = config.keyWords;
let from = config.from;
let to = config.to;
let admin = config.admin;
let subject = config.subject;
let text = config.text;
let titles = config.titles;
let parsers = config.parsers;

module.exports = {
  hunting: hunting,
  reporter: reporter
};

/**
 * start hunting information and send email
 */
function hunting() {
  let pAll = [];

  for (let webParser in parsers) {
    if (parsers.hasOwnProperty(webParser)) {
      let promises = parsers[webParser].parser.buildRequests(parsers[webParser].maxPageNum);
      pAll.push(promises);
    }
  }

  Promise.all(pAll).then(function(htmlStrArr) {
    let htmlObj = {};
    for (let htmlStrObj of htmlStrArr) {
      htmlObj[htmlStrObj.websiteName] = htmlStrObj.htmlStr;
    }
    return htmlObj;
  })
  .then(function(htmlObj) {
    let jobAllArr = [];
    for (let website in htmlObj) {
      if (htmlObj.hasOwnProperty(website)) {
        let dataStr = iGetInnerText(htmlObj[website]);
        let parser = parsers[website].parser.parser;
        let jobArr = parser(dataStr, keyWords);
        jobArr = clearJobArr(jobArr);
        jobAllArr.push({
          websiteName: website,
          jobArr: jobArr
        });
      }
    }
    return jobAllArr;
  })
  .then(function(jobAllArr) {
    let jobCount = 0;
    let outStr = '';
    for (let jobArr of jobAllArr) {
      let title = titles[jobArr.websiteName];
      outStr = outStr + buildEmailHtmlTitle(title);
      for (let job of jobArr.jobArr) {
        if (!job.companyName) {
          continue;
        }
        jobCount++;
        outStr = outStr + buildEmailHtml(job);
      }
    }

    if (jobCount === 0) {
      logger.writeLog('there is no new job!');
      return;
    }

    let mailOptions = {
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: outStr // html body
    };
    logger.writeLog('Sending email.');
    emailer.sendMail(mailOptions);
  });
}

/**
 * send log information to administrators
 */
function reporter() {
  let logStr = '读取日志文件出错！';
  try {
    logStr = fs.readFileSync(logFilePath).toString();
  } catch(e) {
    logStr = logStr + e.message;
  }

  let mailOptions = {
    from: from,
    to: admin,
    subject: 'Hunter Log',
    text: logStr
  };

  emailer.sendMail(mailOptions);
}

/**
 * get inner text
 * @param {string} testStr html string
 * @returns {string} inner html string
 */
function iGetInnerText(testStr) {
   var resultStr = testStr.replace(/\ +/g, ""); //去掉空格
   resultStr = resultStr.replace(/[ ]/g, "");    //去掉空格
   resultStr = resultStr.replace(/[\r\n]/g, ""); //去掉回车换行
   return resultStr;
}

/**
 * clear the exit company information
 * @param {array} jobArr job array
 * @return {array} job array
 */
function clearJobArr(jobArr) {
  let exitCompanyArr = JSON.parse(JSON.stringify(jobList));
  let jobs = [];
  for (let job of jobArr) {
    if (exitCompanyArr.indexOf(job.companyName) === -1) {
      exitCompanyArr.push(job.companyName);
      jobs.push(job);
    }
  }
  jobList = exitCompanyArr;

  return jobs;
}

/**
 * build html title of email
 * @param {string} title website company title
 * @returns {string} html string
 */
function buildEmailHtmlTitle(title) {
  return `<h1>${title}</h1>`
}

/**
 * build html body of email
 * @param {object} job job information
 * @returns {string} html string of email body
 */
function buildEmailHtml(job) {
  let str = `<li>描述关键字：${job.jobName}</li><li>公司名称:${job.companyName}</li><li>工资范围:${job.money}</li><li>公司规模:${job.scale}</li><li>工作地点:${job.location}</li><li>学历要求:${job.education}</li><li>招聘链接:${job.companyLink}</li><li>招聘发布时间：${job.date}</li></hr>`
  return str;
}