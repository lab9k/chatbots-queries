const request = require('request');
const download = require('downloadjs');
const nodeFetch = require('node-fetch');
const nalantisApi = require('../services/nalantisApi');
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
    console.log('alexandria');
    headers = {
      'AW-API-KEY': process.env.AW_API_KEY
    };
    nodeFetch(url, {
      headers
    })
      .then(r => r.json())
      .then(json => {
        console.log(json);
        setDownloadName(req, res, json.filename);
        const dlUri = `${'https://digipolis-poc.alexandria.works/v0.1'}${
          json.file.uri
        }`;
        var stream = request.get(dlUri, { headers }).pipe(res);
        stream.on('error', function(err) {
          res.send(500, err);
        });
      });
  } else {
    headers = {
      Authorization: `Bearer ${nalantisApi.token.value}`,
      Accept: 'application/octet-stream'
    };
    var stream = request.get(url, { headers }).pipe(res);
    stream.on('error', function(err) {
      res.send(500, err);
    });
  }
}

router.get('/download-proxy', downloadProxy);

module.exports = router;
//  public async downloadFile(uuid: string) {
//     const uri = `${this.baseUrl}/documents/${uuid}`;
//     const resp = await nodeFetch(uri, {
//       headers: {
//         'AW-API-KEY': `${this.getCredentials()}`,
//       },
//     });
//     const documentDetailsBody = await resp.json();
//     const dlUri = `${this.baseUrl}${documentDetailsBody.file.uri}`;
//     console.log(dlUri);
//     const { headers } = await nodeFetch(dlUri, {
//       headers: {
//         'AW-API-KEY': `${this.getCredentials()}`,
//       },
//     });
//     console.log(headers);
//     const contentDisposition = headers.get('content-disposition');
//     const attachment = contentDisposition.split('; ');
//     const filename = attachment[1].split('=')[1];
//     const trimmedFileName = filename.trim();
//     console.log(trimmedFileName);
//     const contentType = headers.get('content-type');

//     const dlOptions: download.DownloadOptions = {
//       filename: trimmedFileName,
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//         'AW-API-KEY': `${this.getCredentials()}`,
//       },
//     };
//     return {
//       contentType: contentType.split(';')[0],
//       buffer: await download(dlUri, './downloads', dlOptions),
//       filename: trimmedFileName,
//     };
//   }
