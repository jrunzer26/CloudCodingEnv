$(document).ready(function() {
  
  if (window.location.href.includes("?quizid")) {
    var quizID = window.location.href.substring(window.location.href.indexOf('=') + 1);
    loadQuizQuestions(quizID);
  } else {
    getQuizPostings();
  }
});

/**
 * Gets and loads the quizzes.
 */
function getQuizPostings() {
  $.ajax({
    type: 'GET',
    url: '/quiz/quizListings',
    success: function(output) {
      loadQuizDescriptions(output);
    }
  });
}

/**
 * Disects the quiz data from the server.
 * @param {*} quizData the rows of quiz data
 */
function loadQuizDescriptions(quizData) {
  for(var i = 0; i < quizData.length; i++) {
    appendQuizInfo(quizData[i]);
  }
}

/**
 * Formats and inserts a quiz into the #quizFeed
 * @param {*} data a quiz
 */
function appendQuizInfo(data) {
  var date = new Date(Date.parse(data.expDate));
  console.log(date);
  $('#quizFeed').append(
    '<div id="'+data.id+'" class="quiz">'+
      '<h3><a href="/quiz?quizid='+data.id+'">'+data.name+'</a></h3>'+
    '<div class="date">'+date.toDateString()+'</div></div>');
}

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
      '<div>' + question.question+'</div><br>'+
      appendAnswers(question) +
    '</div><br><br>'
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
    string += '<div>'+question.answers[i].value+'</div><br>';
  }
  return string;
}