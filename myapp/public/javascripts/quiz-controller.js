$(document).ready(function() {
  getQuizPostings();
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
  $('#quizFeed').append(
    '<div id="'+data.id+'" class="quiz">'+
      '<h3><a href="/quiz?quizid='+data.id+'">'+data.name+'</a></h3>'+
    '<div class="date">Jan 27</div></div>');
}