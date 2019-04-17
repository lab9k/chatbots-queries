var express = require('express');
var router = express.Router();
var nalantisApi = require('../services/nalantisApi');
var alexandriaApi = require('../services/alexandriaApi');
const airtableApi = require('../services/airtable.api');

router.post('/responses', function(req, res, next) {
  const searches = [
    nalantisApi.query(req.body.question),
    alexandriaApi.query(req.body.question)
  ];
  Promise.all(searches)
    .then(results => {
      res.json({ nalantis: results[0], alexandria: results[1] });
    })
    .catch(err => console.log(err));
});

router.post('/vote', (req, res) => {
  const { positive, item, question, feedbackText, sessionid } = req.body;
  const api = new airtableApi();
  const record = {
    question,
    sessionid,
    feedback: positive,
    document: item.uuid || item.resourceURI,
    provider: item.from,
    review: feedbackText
  };
  console.log(`Adding record: ${JSON.stringify(record)}`);
  api.addLine(record);
  return res.status(200).json({ message: 'success' });
});

module.exports = router;
