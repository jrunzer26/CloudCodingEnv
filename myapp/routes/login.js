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
  // google auth here maybe?
  Users.getUser(req.body.email, function(user) {
    if (user)
      res.status(200).json({email: user.email, firstName: user.firstName});
    else 
      res.status(407);
  });
});

module.exports = router;