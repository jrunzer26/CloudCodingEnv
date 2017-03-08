var currentProgram = "";
var editor

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

function openNav() {
	console.log('open');
   	document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("backgroundContainer").style.marginLeft = "250px";
	console.log('open');
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("backgroundContainer").style.marginLeft = "0";
}

function closeProgram(id) {
	console.log('closing program: ' + id);
	askSave();
	$('#' + id).remove();
	// todo: remove program from program list
	openNextProgram();
}

function askSave() {
	// pops up to ask if the user would like to save their program.
}

// displays the next program on the list
function openNextProgram() {
	
}

function switchProgram(id) {
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
	// set codemirror text not working
	editor.setValue('cout << "otherProgram" endl;');
}