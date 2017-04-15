const fs = require('fs');
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
  let baseUrl = `http://big5.51job.com/gate/big5/search.51job.com/jobsearch/search_result.php?fromJs=1&jobarea=030200%2C00&district=000000&funtype=0000&industrytype=00&issuedate=9&providesalary=99&keywordtype=2&lang=c&stype=1&postchannel=0000&workyear=99&cotype=99&degreefrom=99&jobterm=99&companysize=99&lonlat=0%2C0&radius=-1&ord_field=0&list_type=0&fromType=14&dibiaoid=0&confirmdate=9&curr_page=`;
  let urlArr = buildUrlArr(baseUrl, maxPageNum);

  let promises = spider(urlArr, 'wy');
  return promises;
}

/**
* Main function, translate the html string, return job array.
* @param {string} dataStr html string
* @param {array} keyWords key words
* @returns {array} job array
*/
function parser(dataStr, keyWords) {
  let re = /\<divclass=\"el[\S]*?\<\/div\>/ig;
  let dataArr = dataStr.match(re);
  let wantedJobsArr = [];
  for (let jobStr of dataArr) {
    for (let keyWord of keyWords) {
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
}

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
    return;
  }
  let obj = {};
  try {
    // job name
    let jobNameStrArr = str.match(/onmousedown=\"\"\>[\S]*?\<\/a\>\<\/span\>\<\/p\>/);
    if (jobNameStrArr.length < 1) {
      return {};
    }
    let jobNameStr = jobNameStrArr[0];
    let jobName = jobNameStr.replace(/onmousedown=\"\"\>/, '');
    jobName = jobName.replace(/\<\/a\>\<\/span\>\<\/p\>/, '');
    obj.jobName = jobName;

    // company
    let companyStr = str.match(/\<spanclass=\"t2\"><atarget=\"_blank\"title=\"[\S]*?\"href=\"[\S]*?\"/)[0];
    let companyName = companyStr.replace(/\<spanclass=\"t2\"><atarget=\"_blank\"title=\"/, '');
    companyName = companyName.replace(/\"href=\"[\S]*?\"/, '');
    obj.companyName = companyName;

    let companyLink = companyStr.replace(/\<spanclass=\"t2\"><atarget=\"_blank\"title=\"[\S]*?\"href=\"/, '');
    companyLink = companyLink.replace(/\"/, '');
    obj.companyLink = companyLink;

    // money
    let moneyStr = str.match(/\<spanclass=\"t4\"\>[\S]*?\<\/span\>/)[0];
    let money = moneyStr.replace(/\<spanclass=\"t4\"\>/, '');
    money = money.replace(/\<\/span\>/, '');
    obj.money = money;

    // location
    let locationStr = str.match(/\<spanclass=\"t3\"\>[\S]*?\<\/span\>/)[0];
    let location = locationStr.replace(/\<spanclass=\"t3\"\>/, '');
    location = location.replace(/\<\/span\>/, '');
    obj.location = location;

    // company scale
    obj.scale = '需要進一步了解';

    // education
    obj.education = '需要進一步了解';

    let dateStr = str.match(/\<spanclass=\"t5\"\>[\S]*?\<\/span\>/)[0];
    let date = dateStr.replace(/\<spanclass=\"t5\"\>/, '');
    date = date.replace(/\<\/span\>/, '');

    obj.date = date;
  } catch(e) {
    console.warn(e.message);
  }

  return obj;
}
