var express = require('express');
var router = express.Router();
var nalantisApi = require('../services/nalantisApi');
var alexandriaApi = require('../services/alexandriaApi');

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

module.exports = router;
