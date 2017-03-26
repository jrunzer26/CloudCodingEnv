var express = require('express');
var router = express.Router();
var Quizzes = require('../models/Quizzes.js');

/**
 * Get the main quiz creator page.
 */
router.get('/', function(req, res, next) {
    res.render('quiz-manager', { title: 'Quiz Manager' });
});

/**
 * Adds a quiz to the database.
 */
router.post('/deleteQuiz', function(req, res, next) {
    Quizzes.deleteQuiz(req.body.quizId, function(success) {
        res.status(200).json({success: success});
    });
});

module.exports = router;	