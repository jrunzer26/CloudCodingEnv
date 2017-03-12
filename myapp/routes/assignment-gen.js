var express = require('express');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;
var router = express.Router();
var Users = require('../models/Users.js');

router.get('/', function(req, res, next) {
    res.render('assignment-gen', { title: 'Assignment Generator' });
});

module.exports = router;	