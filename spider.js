const axios = require('axios');

/**
 * Crawl web information of urlArr argument, then return the html string object.
 * @param {array} urlArr url array
 * @param {string} websiteName website name
 * @returns {object} an object include websiteName & html string.
 */
module.exports = function(urlArr, websiteName) {
  let promises = urlArr.map(function(url) {
    return axios.get(url);
  });

  return Promise.all(promises).then(function(responseArr) {
    let htmlStr = '';
    for (let res of responseArr) {
      htmlStr = htmlStr + res.data;
    }

    return {
      websiteName: websiteName,
      htmlStr: htmlStr
    };
  });
}