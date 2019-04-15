var request = require('request');
var nalantisApi = require('../services/nalantisApi');
const express = require('express');
const router = express.Router();

function setDownloadName(req, res, fileName) {
  var userAgent = (req.headers['user-agent'] || '').toLowerCase();
  if (userAgent.indexOf('chrome') > -1) {
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + encodeURIComponent(fileName)
    );
  } else if (userAgent.indexOf('firefox') > -1) {
    res.setHeader(
      'Content-Disposition',
      "attachment; filename*=\"utf8''" + encodeURIComponent(fileName) + '"'
    );
  } else {
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + new Buffer(fileName).toString('binary')
    );
  }
}
/**
 * make a proxy to convert http download file name
 *  eg.
 *      if browser request: /download-proxy?url=http://domain/not-readable-file.png&name=readable-file.png,
 *      then will get a download attachment named readable-file.png
 */
function downloadProxy(req, res) {
  req.setEncoding('utf8');

  var url = req.query.url;
  var name = req.query.name;
  var provider = req.query.provider;
  console.log(`Downloading:
  name: ${name}
  url: ${url}
  provider: ${provider}`);

  setDownloadName(req, res, name);

  let headers = {};
  if (provider === 'alexandria.works') {
    headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      AW_API_KEY: process.env.AW_API_KEY
    };
  } else {
    headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${nalantisApi.token}`
    };
  }
  var stream = request.get(url, { headers }).pipe(res);

  stream.on('error', function(err) {
    res.send(500, err);
  });
}

router.get('/download-proxy', downloadProxy);

module.exports = router;
