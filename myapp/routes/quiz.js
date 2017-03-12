var express = require('express');
const queryString = require('query-string');
var router = express.Router();
var Users = require('../models/Users.js');
var Quizzes = require('../models/Quizzes.js');

/**
 * Gets the quiz hub or the specific quiz page.
 */
router.get('/', function(req, res, next) {
  const parsedURL = queryString.parse(req.originalUrl.replace('/quiz', ''));
  // load the quiz page if there is a quiz attached to it.
  if(parsedURL.quizid) {
    Quizzes.getQuizInfo(parsedURL.quizid, function(data) {
      if (data) {
        res.render('quiz', {title: 'Quiz', quizName: data.name});
      } else {
        res.render('quiz', {title: 'Quiz', quizName: 'quiz not found'});
      }
    });  
  } else
    res.render('quizHub', { title: 'Quiz' });
});

/**
 * Returns the quiz listings in json format.
 * [{id: "1", name:"Intro Quiz", expDate: "timestamp", "creator": "jason.runzer@uoit.net"}]
 */
router.get('/quizListings', function (req, res, next) {
    Quizzes.getQuizListings(function(data) {
        res.status(200).json(data);
    });
});

/**
 * Gets the quiz questions based on the quiz id.
 */
router.post('/getQuizQuestions', function(req, res, next) {
  
});

module.exports = router;