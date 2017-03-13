var currentProgram = "";
var editor
var listOfPrograms = {};


$(document).ready(function() {
	var code = $(".codemirror-textarea")[0];
	editor = CodeMirror.fromTextArea(code, {
		lineNumbers : true,
		value: "function myScript(){return 100;}\n",
		mode: "text/x-c++src",
		theme: "default"
	});


	$("#showText").click(function() {
		var text = editor.getValue();
		var inputParams = $('#inputParams').val().split(",");
		var cinParams = $('#cinParams').val();
		console.log(inputParams);
		$.ajax({
			type: 'GET',
			url: '/code',
			data: {codeValue: text, inputList: inputParams, cin: cinParams},
			success: function(output) {
				$('#outputOfCode').val(output);
			}
		})
	});

});


function setEditorText(info){
	editor.setValue(info);
}

function getEditorText() {
	return editor.getValue();
}

function testFunction() {
	$.ajax({
		type: 'GET',
		url: '/auth',
		success: function(output) {
			console.log(output);
		}
	})
}

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var id_token = googleUser.getAuthResponse().id_token;
  console.log(id_token);
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  }


function closeProgram(id) {
	console.log('closing program: ' + id);
	askSave();
	delete listOfPrograms[id];
	$('#' + id).remove();
	// todo: remove program from program list
	openNextProgram();
}

function askSave() {
	// pops up to ask if the user would like to save their program.
	alert("Do you want to save file: "+ currentProgram);
	saveFile(currentProgram);
}

function newFile() {
	var fileName = window.prompt("Enter file name: ", "testFile");
	var htmlCode = '<div id="'+fileName+'" onclick="switchProgram(\''+fileName+'\')" class="program tableCol"><p class="tableCol">'+fileName+'</p><i onclick="closeProgram(\''+fileName+'\')" class="fa fa-times tabelCol"></i></div>';
    $('#programsList').append(htmlCode);
    switchProgram(fileName);
   // listOfPrograms[fileName] = getEditorText();

}

// displays the next program on the list
function openNextProgram() {
	console.log(Object.keys(listOfPrograms)[0]);
	$('#' + Object.keys(listOfPrograms)[0]).addClass("selectedProgram");
	quickLoadFile(Object.keys(listOfPrograms)[0]);
}

function quickSaveFile(id) {
	listOfPrograms[id] = getEditorText();
}

function quickLoadFile(id) {
	if(listOfPrograms[id]) {
		editor.setValue(listOfPrograms[id]);
	} else {
		editor.setValue("");
	}
}

function switchProgram(id) {
	if(currentProgram != "") {
		console.log("Inst that Ironic");
		quickSaveFile(currentProgram);
	}
	unselectProgram(currentProgram);
	selectProgram(id);
	currentProgram = id;
	console.log("switch: " + id);
}

function unselectProgram(id) {
	if (id != "")
		$('#' + id).removeClass("selectedProgram");
}

function selectProgram(id) {
	console.log('select program');
	$('#' + id).addClass("selectedProgram");
	quickLoadFile(id);
}