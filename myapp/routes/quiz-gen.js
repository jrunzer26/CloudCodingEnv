var express = require('express');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;
var router = express.Router();
var Users = require('../models/Users.js');

router.get('/', function(req, res, next) {
    res.render('quiz-gen', { title: 'Quiz Creator' });
});

router.post('/addQuiz', function(req, res, next) {
    console.log(req.body.quiz);
    res.sendStatus(200);
});

module.exports = router;	