

$(document).ready(function() {
  $('#addAnswerButton').hide();
});

function saveQuestion() {
  console.log("saveQuestion");
  $("#addQuestion").attr("onclick", "addQuestion()");
  $("#addQuestion").html('<i class="fa fa-plus" aria-hidden="true"></i>');
  $('#addAnswerButton').hide();
  var question = extractQuestion();
  saveQuestionToList(question);
}

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
  console.log(question.question);
  return question;
}

function addQuestion() {
  console.log('addQuestion');
  $("#addQuestion").attr("onclick", "saveQuestion()");
  $("#addQuestion").html('<i class="fa fa-check" aria-hidden="true"></i>');
  addQuestionStub();
}

function addQuestionStub() {
  $('#workingQuestions').append('<label>Question</label>');
  $('#workingQuestions').append('<input class="form-control questionText">');
  $('#workingQuestions').append('<div id="workingRadio" class="radio"></div>');
  $('#addAnswerButton').show();
}

function saveQuiz() {
  console.log("saveQuiz");
  var quiz = {title: "", questions: []};
  quiz.title = $('#quizTitle').val();
  $('#savedQuizQuestions > div').each(function() {
    var question = {question: "", answers: []};
    question.question = $('h4', this).text();
    //console.log($('form > .radio > label', this));
    $('form > .radio > label', this).each(function() {
      var answer = {};
      answer.correctAnswer = $('input', this).is(':checked');
      answer.value = $(this).text();
      question.answers.push(answer);
      //console.log(question);
    });
    quiz.questions.push(question);
  });
  postQuiz(quiz);
  //console.log(quiz);
}

function postQuiz(quiz) {
  var data = {
    userID: "jason.runzer@uoit.net",
    quiz: quiz
  };
  //console.log(data);
  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: '/quiz-gen/addQuiz',
    success: function(output) {
      alert('success!');
    }
  });
}

function addAnswer() {
  console.log("addAnswer");
  insertAnswerSlot();
}

function insertAnswerSlot() {
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
    console.log(question.answers[i].answer);
    string += '<div class="radio">'+
      '<label><input type="radio" ';
    if(question.answers[i].checked) {
      string += 'checked="'+question.answers[i].checked+'">';
    }
    string += question.answers[i].answer+'</label>'+
      '</div>';
  }
  console.log(string);
  return string;
}
