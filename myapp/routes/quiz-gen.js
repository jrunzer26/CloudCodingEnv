var express = require('express');
var router = express.Router();
var Quizzes = require('../models/Quizzes.js');

/**
 * Get the main quiz creator page.
 */
router.get('/', function(req, res, next) {
    res.render('quiz-gen', { title: 'Quiz Creator' });
});

/**
 * Adds a quiz to the database.
 */
router.post('/addQuiz', function(req, res, next) {
    Quizzes.addQuiz(req.body.quiz, req.body.userID, function() {
        res.sendStatus(200);
    });
});

module.exports = router;	