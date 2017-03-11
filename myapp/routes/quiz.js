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
        res.render('quiz', {title: 'Quiz ' + parsedURL.quizid, quizName: data.name});
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
  console.log("quiz id: " + req.body.quizid);
  Quizzes.getQuizQuestions(req.body.quizid, function(data) {
    if (data != null) {
      res.status(200).json(data);
    } else {
      res.render('quizHub', {title: 'Quiz'});
    }
  });
});

router.post('/submitAnswers', function(req, res, next) {
  Quizzes.gradeQuiz(req.body.quizId, "jason.runzer@uoit.net", req.body.answers, function(results) {
    console.log("done");
     res.status(200).json({results});
  });
});

module.exports = router;