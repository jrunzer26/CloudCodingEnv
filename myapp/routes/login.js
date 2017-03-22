var express = require('express');
var router = express.Router();
var Users = require('../models/Users.js');

/* GET login page */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

/**
 * Stores the login info and redirects?
 */
router.post('/login', function(req, res, next) {
  
});

module.exports = router;