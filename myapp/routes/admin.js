var express = require('express');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;
var router = express.Router();
var Users = require('../models/Users.js');

/**
 * Loads the admin page.
 */
router.get('/', function(req, res, next) {
    res.render('admin', { title: 'Administration' });
});

module.exports = router;	