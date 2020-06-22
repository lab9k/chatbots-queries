var express = require('express');
var router = express.Router();
var nalantisApi = require('../services/nalantisApi');
const airtableApi = require('../services/airtable.api');

router.post('/responses', function (req, res, next) {
  nalantisApi
    .query(req.body.question)
    .then((results) => {
      res.json({ nalantis: results, alexandria: [] });
    })
    .catch(() =>
      res.json({ nalantis: { documents: [] }, alexandria: { results: [] } })
    );
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
    review: feedbackText,
  };
  console.log(`Adding record: ${JSON.stringify(record)}`);
  api.addLine(record);
  return res.status(200).json({ message: 'success' });
});

module.exports = router;
