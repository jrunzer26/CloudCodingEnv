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
exports.getCompleteQuiz = function(quizId, callback) {

}