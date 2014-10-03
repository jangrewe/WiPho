var express = require('express');
var router = express.Router();

/* GET all photos. */
router.get('/', function(req, res) {
  res.json(photos);
});

module.exports = router;
