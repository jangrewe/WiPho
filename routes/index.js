var config = require('../config.json');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { 
    title: 'WiPho'
  });
});

module.exports = router;
