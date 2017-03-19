

function saveQuestion() {
  console.log("saveQuestion");
  $("#addQuestion").attr("onclick", "addQuestion()");
  $("#addQuestion").html('<i class="fa fa-plus" aria-hidden="true"></i>');
}

function addQuestion() {
  console.log('addQuestion');
  $("#addQuestion").attr("onclick", "saveQuestion()");
  $("#addQuestion").html('<i class="fa fa-check" aria-hidden="true"></i>');
}

function saveQuiz() {
  console.log("saveQuiz");
}

function addAnswer() {
  console.log("addAnswer");
  insertAnswerSlot();
}

function insertAnswerSlot() {
  $('#workingRadio').append('<label style="width:100%;"><input type="radio" name="1" value="1"><input class="form-control"></input></label>');
}