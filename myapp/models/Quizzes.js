var db = require('../db.js');

/**
 * Retreives all the quiz listings from the database.
 */
exports.getQuizListings = function(callback) {
  db.any('SELECT * FROM Quizzes;',[])
    .then(function(data) {
      callback(data);
    })
    .catch(function(err) {
      console.log(err);
      callback(err);
    });  
}

/**
 * Retrieves quiz information based on the quiz id.
 */
exports.getQuizInfo = function(quizId, callback) {
  db.any('SELECT * FROM Quizzes WHERE "id" = $1;',[quizId])
    .then(function(data) {
      console.log(data);
      callback(data[0]);
    })
    .catch(function(err) {
      console.log(err);
      callback(null);
    });
}

/**
 * Gets all questions and possible answers for a quiz in the database.
 */
exports.getQuizQuestions = function(quizId, callback) {
  db.any('SELECT * FROM Questions WHERE "quizID" = $1',[quizId])
    .then(function(questionList) {
      var quiz = {quizid: quizId, questions: []};
      var count = 0;
      Promise.all(questionList.map(function(question) {
        return db.any('SELECT "id", "value" FROM Answers WHERE "questionID" = $1;', 
                      [question.id])
        .then(function(questionOptions) {
          var aQuestion = {id: question.id, question: question.question, answers: questionOptions};
          quiz.questions.push(aQuestion);
        })
        .catch(function(err) {
          console.log(err);
          callback(null);
        });
      }))
      .then(function() {
        console.log('callback');
        callback(quiz);
      });
    }
    )
    .catch(function(err) {
      console.log(err);
      callback(null);
    })
}