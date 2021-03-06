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
    });
}

/**
 * Grades the quiz for the user.
 */
exports.gradeQuiz = function(quizId, email, answers, callback) {
  // see if the user already did the quiz.
  var results = {quizId: quizId, mark: 0, results: [], success: "false"};
  var grade = 0;
  var totalQuestions = answers.length;
  var totalCorrectAnswers = 0;
  console.log(totalQuestions);
  console.log(results);

  Promise.all(answers.map(function(answer) {
    return db.any('SELECT * FROM Answers WHERE "questionID" = $1 AND "correctAnswer" = true', [answer.questionId])
      .then(function(correctAnswer) {
        console.log(correctAnswer[0]);
        if(correctAnswer[0].id == answer.answerId) {
          results.results.push({givenAnswer: answer, correct: "true"});
          totalCorrectAnswers++
        } else {
          results.results.push({givenAnswer: answer, correct: "false"});
        }
    })
    .catch(function(err) {
      console.log(err);
    });
   }))
   .then(function() {
     results.success = "false";
     var mark = totalCorrectAnswers / totalQuestions;
     results.mark = mark;
     console.log(results);
     console.log(quizId);
     db.any('SELECT * FROM QuizResults WHERE "email" = $1 AND "quizID" = $2;', [email, quizId])
      .then(function(data) {
        console.log('data: ' + data);
        if (data.length > 0) {
          db.none('UPDATE QuizResults SET "mark" = $1 WHERE "quizID" = $2 AND "email" = $3;', [mark, quizId, email])
          .then(function() {
            callback(results);
          })
          .catch(function(err) {
            console.log(err);
            callback(err);
          });
        } else {
          db.none('INSERT INTO QuizResults ("quizID", "email", "mark") VALUES ($1, $2, $3);', [quizId, email, mark])
          .then(function() {
            callback(results);
          })
          .catch(function(err) {
            console.log(err);
            callback(err);
          });
        }
      })
     .catch(function(err) {
       console.log(err);
     })
   })
   .catch(function(err) {
     console.log(err);
     callback({success:"false"});
  });
}

/**
 * Gets the quiz marks for the user.
 */
exports.getQuizMarks = function(email, callback) {
  db.any('SELECT * FROM QuizResults WHERE "email" = $1;', [email])
  .then(function(results){
    callback(results);
  })
  .catch(function(err) {
    callback(err);
  })
}

/**
 * Adds a quiz to the database.
 */
exports.addQuiz = function(quiz, email, callback) {
  db.any('INSERT INTO Quizzes ("name", "creator") VALUES ($1, $2) RETURNING id;', [quiz.title, email])
  .then(function(id) {
    Promise.all(quiz.questions.map(function(question) {
      db.any('INSERT INTO Questions ("question", "quizID") VALUES ($1, $2) RETURNING id;', [question.question, id[0].id])
      .then(function(id) {
        Promise.all(question.answers.map(function(answer) {
          return db.any('INSERT INTO Answers ("value", "correctAnswer", "questionID") VALUES ($1, $2, $3);', [answer.value, answer.correctAnswer, id[0].id])
          .catch(function(err) {
            console.log(err);
            callback(false);
          });
        }))
        .then(function() {
          callback(true);
        });
      })
      .catch(function(err) {
        console.log(err);
      });
    }));
    
  })
  .catch(function(err) {
    console.log(err);
  });
}

/**
 * Deletes a quiz.
 */
exports.deleteQuiz = function(quizID, callback) {
  db.none('DELETE FROM Quizzes WHERE "id" = $1;', [quizID])
  .then(function() {
    callback("Deleted quiz " + quizID);
  })
  .catch(function(err) {
    console.log(err);
    callback("Error deleting quiz " + quizID);
  });
}
