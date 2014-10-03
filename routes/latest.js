var express = require('express');
var router = express.Router();

/* GET latest photo. */
router.get('/', function(req, res) {
  res.json(photos[photos.length-1]);
});

module.exports = router;
