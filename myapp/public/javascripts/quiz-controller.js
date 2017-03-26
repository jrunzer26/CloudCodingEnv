var GLOBAL_QUIZ;
var GLOBAL_QUIZ_ID;

$(document).ready(function() {
  if (window.location.href.includes("?quizid")) {
    var quizID = window.location.href.substring(window.location.href.indexOf('=') + 1);
    GLOBAL_QUIZ_ID = quizID;
    loadQuizQuestions(quizID);
  } else if (window.location.href.includes("quiz-manager")) {
    getQuizPostings2(true);
  } else {
    getQuizPostings();
  }
});

// QUIZ HUB 

/**
 * Gets and loads the quizzes.
 */
function getQuizPostings2(admin) {
  $.ajax({
    type: 'GET',
    url: '/quiz/quizListings',
    success: function(output) {
      loadQuizDescriptions(output, admin);
      if (!admin)
        loadMarks();
    }
  });
}

function getQuizPostings() {
  getQuizPostings2(false);
}

/**
 * Disects the quiz data from the server.
 * @param {*} quizData the rows of quiz data
 */
function loadQuizDescriptions(quizData, admin) {
  for(var i = 0; i < quizData.length; i++) {
    appendQuizInfo(quizData[i], admin);
  }
}

/**
 * Formats and inserts a quiz into the #quizFeed
 * @param {*} data a quiz
 */
function appendQuizInfo(data, admin) {
  var theHtml = '<div id="'+data.id+'" class="quiz">'+
      '<h3><a style="padding-right:16px;" href="/quiz?quizid='+data.id+'">'+data.name+'</a>';
      if (admin) {
        theHtml += '<button class="btn btn-xs btn-danger" onclick="deleteQuiz('+data.id+')"><i class="fa fa-times" aria-hidden="true"></i></button>'
      }
      theHtml += '</h3>';
  $('#quizFeed').append(theHtml);
}

/**
 * Inserts the marks in the quiz listing.
 */
function loadMarks() {
  $.ajax({
    type: 'POST',
    data: {email: "jason.runzer@uoit.net"},
    url: '/quiz/getQuizMarks',
    success: function(output) {
      inputQuizMarks(output);
    }
  });
}

/**
 * Inputs the quiz marks into each question.
 * @param {*} data 
 */
function inputQuizMarks(data) {
  for(var i = 0; i < data.length; i++) {
    console.log(data[i]);
    $('#'+data[i].quizID).append('<div>' + data[i].mark * 100 + '%</div>');
  }
}

// QUIZ

/**
 * Loads the quiz questions from the server
 * @param {*} quizID 
 */
function loadQuizQuestions(quizID) {
  $.ajax({
    type: 'POST',
    data: {quizid: quizID},
    url: '/quiz/getQuizQuestions',
    success: function(output) {
      GLOBAL_QUIZ = output;
      loadAllQuizQuestion(output);
    }
  });
}

/**
 * Loads all quiz questions from the quiz into the html.
 * @param {*} quiz 
 */
function loadAllQuizQuestion(quiz) {
  if (quiz.questions.length > 0) {
    for (var i = 0; i < quiz.questions.length; i++) {
      loadQuestion(quiz.questions[i]);
    }
  } else {
    console.log('quiz does not exist!');
  }
}

/**
 * Loads a question on the page.
 * @param {*} question 
 */
function loadQuestion(question) {
  console.log(question);
  $('#questions').append(
    '<div>'+
      '<h4>' + question.question+'</h4>'+
      '<form>' +
        appendAnswers(question) +
      '</form>' +
    '</div><br>'
  );
}

/**
 * Appends a possible question answer to the question.
 * @param {*} question 
 */
function appendAnswers(question) {
  var string = '';
  for (var i = 0; i < question.answers.length; i++) {
    console.log(question.answers[i].id);
    string += '<div class="radio">'+
      '<label><input type="radio" name="'+question.id+'" value="'+question.answers[i].id+'">'+''+question.answers[i].value+'</label>'+
      '</div>';
  }
  return string;
}

/**
 * Submits the quiz to the server.
 */
function submitQuiz() {
  var collectedAnswers = [];
  var quizFinished = true;
  for(var i = 0; i < GLOBAL_QUIZ.questions.length; i++) {
    var questionId = GLOBAL_QUIZ.questions[i].id;
    var answerId = $("input:radio[name='"+questionId+"']:checked").val();
    console.log(questionId + " " + answerId);
    if (!answerId) {
      quizFinished = false;
    }
    collectedAnswers.push({questionId: questionId, answerId: answerId});
  }
  console.log("finished");
  if (quizFinished) {
    postQuizAnswers(collectedAnswers);
  } else {
    alert("Please finish the quiz. Question: " + questionId + " is empty.")
  }
}

/**
 * Posts the quiz answers when the quiz is finished.
 * @param {*} collectedAnswers 
 */
function postQuizAnswers(collectedAnswers) {
  console.log("posting quiz answers")
  // append id/google auth
  var data = {
    userID: "jason.runzer@uoit.net",
    quizId: GLOBAL_QUIZ_ID,
    answers: collectedAnswers
  };
  console.log(data);
  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: '/quiz/submitAnswers',
    success: function(output) {
      console.log('output: ' + output);
      loadResults(output);
    }
  });
}

/**
 * Loads the results from the quiz
 * @param {*} data 
 */
function loadResults(data) {
  $('#mark').text('Mark: ' + data.results.mark * 100 + '%');
  $("input[type=radio]").attr('disabled', true);
  showWrongAnswers(data);
  toggleRetryButton();
  $('#quizModal').modal('toggle');
}

/**
 * Inserts the fa-icon into the quiz question.
 * @param {*} data 
 */
function showWrongAnswers(data) {
  var resultsArray = data.results.results;
  console.log(data);
  for(var i = 0; i< resultsArray.length; i++) {
    var optionText = $("input:radio[name='"+resultsArray[i].givenAnswer.questionId+"'][value='"+resultsArray[i].givenAnswer.answerId+"']").parent().html();
    var icon = "";
    if (resultsArray[i].correct == "true") {
      icon = ' <i class="fa fa-check" aria-hidden="true"></i>';
    } else 
      icon = ' <i class="fa fa-times" aria-hidden="true"></i>';
    $("input:radio[name='"+resultsArray[i].givenAnswer.questionId+"'][value='"+resultsArray[i].givenAnswer.answerId+"']").parent().html(optionText + icon);
  }
}

/**
 * Changes the submit quiz button into the retry quiz button.
 */
function toggleRetryButton() {
  $('#submitQuiz').attr("onclick", "retry()");
  $('#submitQuiz').text("Retry Quiz");
  $('#submitQuiz').attr("id", "retryButton");
}

function retry() {
  location.reload();
}

function navQuiz() {
  window.location = "/quiz";
}

/**
 * Deletes a quiz from the server.
 * @param {*} id 
 */
function deleteQuiz(id) {
  if (confirm('Are you sure you want to delete quiz: '+id+'?')) {
    var data = {
      userID: "jason.runzer@uoit.net",
      quizId: id,
    };
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/quiz-manager/deleteQuiz',
      success: function(output) {
        console.log('output: ' + output);
        alert(output.success);
        location.reload();
      }
    });
  }
 
}

