$(document).ready(function() {
  $('#addAnswerButton').hide();
});

/**
 * Saves a question that is being worked on.
 */
function saveQuestion() {
  console.log("saveQuestion");
  $("#addQuestion").attr("onclick", "addQuestion()");
  $("#addQuestion").html('<i class="fa fa-plus" aria-hidden="true"></i>');
  $('#addAnswerButton').hide();
  var question = extractQuestion();
  saveQuestionToList(question);
}

/**
 * Extracts a question from the input forms.
 */
function extractQuestion() {
  var question = {question: "", answers: []};
  question.question = $('.questionText').val();
  $('.answerSlot').each(function() {
    console.log(this);
    var answer = {checked:"false", answer:""}
    answer.checked = $(this).children(':nth-child(1)').is(':checked');
    answer.answer = $(this).children(':nth-child(2)').val();
    question.answers.push(answer);
  });
  return question;
}

/**
 * Adds a question to work on.
 */
function addQuestion() {
  console.log('addQuestion');
  $("#addQuestion").attr("onclick", "saveQuestion()");
  $("#addQuestion").html('<i class="fa fa-check" aria-hidden="true"></i>');
  addQuestionStub();
}

/**
 * Adds a question stub into the html.
 */
function addQuestionStub() {
  $('#workingQuestions').append('<label>Question</label>');
  $('#workingQuestions').append('<input class="form-control questionText">');
  $('#workingQuestions').append('<div id="workingRadio" class="radio"></div>');
  $('#addAnswerButton').show();
}

/**
 * Saves the quiz to the server.
 */
function saveQuiz() {
  console.log("saveQuiz");
  var quiz = {title: "", questions: []};
  quiz.title = $('#quizTitle').val();
  $('#savedQuizQuestions > div').each(function() {
    var question = {question: "", answers: []};
    question.question = $('h4', this).text();
    $('form > .radio > label', this).each(function() {
      var answer = {};
      answer.correctAnswer = $('input', this).is(':checked');
      answer.value = $(this).text();
      question.answers.push(answer);
    });
    quiz.questions.push(question);
  });
  postQuiz(quiz);
}

/**
 * Posts a quiz to the server.
 * @param {*} quiz 
 */
function postQuiz(quiz) {
  var data = {
    userID: "jason.runzer@uoit.net",
    quiz: quiz
  };
  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: '/quiz-gen/addQuiz',
    success: function(output) {
      alert('success!');
      window.location = '/';
    },
    error: function() {
      alert('fail');
    }
  });
}

/**
 * Adds an answer box to the working question.
 */
function addAnswer() {
  $('#workingRadio').append('<label class="answerSlot" style="width:100%;"><input type="radio" name="1" value="1"><input class="form-control answer"></input></label>');
}

/**
 * Loads a question on the page.
 * @param {*} question 
 */
function saveQuestionToList(question) {
  console.log(question);
  $('#savedQuizQuestions').append(
    '<div>'+
      '<h4>' + question.question+'</h4>'+
      '<form>' +
        appendAnswers(question) +
      '</form>' +
    '</div><br>'
  );
  $('#workingQuestions').children().remove();
}

/**
 * Appends a possible question answer to the question.
 * @param {*} question 
 */
function appendAnswers(question) {
  var string = '';
  for (var i = 0; i < question.answers.length; i++) {
    string += '<div class="radio">'+
      '<label><input type="radio" ';
    if(question.answers[i].checked) {
      string += 'checked="'+question.answers[i].checked+'"';
    }
    string += '>';
    string += question.answers[i].answer+'</label>'+
      '</div>';
  }
  return string;
}
