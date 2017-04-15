const logger = require('../logger.js');
const spider = require('../spider.js');

module.exports = {
  buildRequests: buildRequests,
  parser: parser
};

/**
 * Build the request promises
 * @returns {promise} request base on axios
 */
function buildRequests() {
  let maxPageNum = 1;
  let baseUrl = `http://sou.zhaopin.com/jobs/searchresult.ashx?jl=%E5%B9%BF%E5%B7%9E&p=`;
  let urlArr = buildUrlArr(baseUrl, maxPageNum);

  let promises = spider(urlArr, 'zl');
  return promises;
}

/**
* Main function, translate the html string, return job array.
* @param {string} dataStr html string
* @param {array} keyWords key words
* @returns {array} job array
*/
function parser(dataStr, keyWords) {
  let re = /\<tablecellpadding=\"0\"cellspacing=\"0\"width=\"853\"class=\"newList\"\>[\S]*?\<\/table\>/ig;
  let dataArr = dataStr.match(re);
  let wantedJobsArr = [];
  for (let jobStr of dataArr) {
    for (let keyWord of keyWords)  {
      if (jobStr.search(keyWord) !== -1) {
        wantedJobsArr.push(jobStr);
        continue;
      }
    }
  }

  let jobArr = [];
  for (let str of wantedJobsArr) {
    let job = getObjFromHtmlStr(str);
    jobArr.push(job);
  }

  return jobArr;
};

/**
 * Build the url array base on baseUrl & max page number.
 * @param {string} baseUrl basic url string
 * @param {number} maxPageNum max page number
 * @returns {array} url array
 */
function buildUrlArr(baseUrl, maxPageNum) {
  let arr = [];
  for (let i = 1; i <= maxPageNum; i++) {
    arr.push(baseUrl + i);
  }
  return arr;
}

/**
 * Calculate the basic companys infomation base on html string.
 * @param {string} str html string
 * @returns {object} basic companys infomation
 */
function getObjFromHtmlStr(str) {
  if (!str) {
    return {};
  }
  let obj = {};

  try {
    // company
    let companyStrArr = str.match(/\<tdclass=\"gsmc\"\>[\S]*?\<\/td\>/);
    if (companyStrArr.length < 1) {
      return {};
    }
    let companyStr = companyStrArr[0];
    let companyName = companyStr.replace(/\<tdclass=\"gsmc\"\>\<ahref=\"[\S]*?\"target=\"_blank\"\>/, '');
    companyName = companyName.replace(/\<\/a\>\<\/td\>/, '');
    obj.companyName = companyName;

    let companyLink = companyStr.replace(/\<tdclass=\"gsmc\"\>\<ahref=\"/, '');
    companyLink = companyLink.replace(/\"target=\"_blank\"\>[\S]*?<\/a\>\<\/td\>/, '');
    obj.companyLink = companyLink;

    // job name
    let jobName = '';
    let jobNameStrArr = str.match(/\<b\>[\S]*?\<\/b\>/g);
    for (let jobNameStr of jobNameStrArr) {
      jobNameStr = jobNameStr.replace(/\<b\>/, '');
      jobNameStr = jobNameStr.replace(/\<\/b\>/, '');
      jobName = jobName + jobNameStr + ' ';
    }
    obj.jobName = jobName;

    // money
    let moneyStr = str.match(/\<tdclass=\"zwyx\"\>[\S]*?\<\/td\>/)[0];
    // if (moneyStrArr.length < 1) {
    //   return {};
    // }
    let money = moneyStr.replace(/\<tdclass=\"zwyx\"\>/, '');
    money = money.replace(/\<\/td\>/, '');
    obj.money = money;

    // location
    let locationStr = str.match(/\<tdclass=\"gzdd\"\>[\S]*?\<\/td\>/)[0];
    let location = locationStr.replace(/\<tdclass=\"gzdd\"\>/, '');
    location = location.replace(/\<\/td\>/, '');
    obj.location = location;

    // company type
    let typeStr = str.match(/公司性质[\S]*?\</)[0];
    let type = typeStr.replace(/公司性质：/, '');
    type = type.replace(/\</, '');
    obj.type = type;

    // company scale
    let scaleStr = str.match(/公司规模[\S]*?\</)[0];
    let scale = scaleStr.replace(/公司规模：/, '');
    scale = scale.replace(/\</, '');
    obj.scale = scale;

    // company education
    let educationStr = str.match(/学历[\S]*?\</)[0];
    let education = educationStr.replace(/学历：/, '');
    education = education.replace(/\</, '');
    obj.education = education;

    // date
    let dateStr = str.match(/\<tdclass=\"gxsj[\S]*?\<\/span\>/)[0];
    let date = dateStr.replace(/\<tdclass=\"gxsj\"\>\<span\>/, '');
    date = date.replace(/\<\/span\>/, '');
    obj.date = date;
  } catch(e) {
    console.warn(e.message);
    logger.writeLog(e.message);
  }

  return obj;
}