var express = require('express');
var router = express.Router();
var Users = require('../models/Users.js');
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2("814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com", '', '');



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