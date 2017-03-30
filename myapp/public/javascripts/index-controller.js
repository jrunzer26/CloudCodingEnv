var GoogleAuth;
var ENGRFolderId;
var existingFolders = [];
var editor;
var currentProgram;
var listOfPrograms = {};
var isFullscreen = false;

$(document).ready(function() {

	$.ajax({
		type: 'GET',
		url: '/main/userType',
		data: {email: sessionStorage.getItem("email")},
		success: function(output) {
			console.log(output);
			sessionStorage.setItem("access", output);
			if(output == "Student") {
				document.getElementById('admin').style.display = 'none';
			}

		}
	})
	getProgramList();
	setFullScreenVariable();

$('#dialog').hide();
$('#dialogClose').hide();

	var code = $(".codemirror-textarea")[0];
	editor = CodeMirror.fromTextArea(code, {
		lineNumbers : true,
		value: "function myScript(){return 100;}\n",
		mode: "text/x-c++src",
		theme: "default"
	});

	$("#showText").click(function() {
		var text = editor.getValue();
		var fileName = "";
		var inputParams = $('#inputParams').val().split(",");
		var cinParams = $('#cinParams').val();
		var textValue = sessionStorage.getItem("email").replace(".","").split("@");
		if(currentProgram.lastIndexOf(".") > 0) {
			var compileName = currentProgram.slice(0, currentProgram.lastIndexOf(".")) + ".c";
			fileName = textValue[0].concat("_", compileName);
		} else {
			var compileName = currentProgram + ".c";
			fileName = textValue[0].concat("_", compileName);
		}	
		$.ajax({
			type: 'GET',
			url: '/main/code',
			data: {codeValue: text, inputList: inputParams, cin: cinParams, fileName: fileName},
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
		url: '/main/auth',
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
	askSave(false);
}

function closeDeletedProgram(id) {
	delete listOfPrograms[id];
	var elem = document.getElementById(id);
	elem.remove();
	openNextProgram();	
}

function publishCode() {
	$('#dialogPublish').dialog({
		modal: true,
		resizable: false,
		buttons: {
			"YES": function() {
				saveProgram(currentProgram, getEditorText());
				$(this).dialog("close");
			},
			"NO": function() {
				$(this.dialog("close"));
			}
		}
	})
}

function askSave(val) {
	// pops up to ask if the user would like to save their program.
	$("#dialogClose").dialog({
		modal: true,
		resizable: false,
		buttons: {
			"YES": function() {
				listOfPrograms[currentProgram] = getEditorText();
				if(!val) {
					delete listOfPrograms[currentProgram];
				}
				saveFile(currentProgram, val);
				$(this).dialog("close");
			},
			"NO": function() {
				if(!val) {
					delete listOfPrograms[currentProgram];
					var elem = document.getElementById(currentProgram);
					elem.remove();
					openNextProgram();	
				}
				$(this).dialog("close");
			},
			"Cancel": function() {
				$(this).dialog("close");
			}
		}
	});
}

function newFile() {
	var fileName = window.prompt("Enter file name: ", "testFile");
	if(fileName !== null) {
		if(Object.keys(listOfPrograms).indexOf(fileName) > -1) {
			var value = confirm("That file already exists! Do you wish to overwrite that file with an empty file?");
			if(value) {
				listOfPrograms[fileName] = "";
				editor.setValue("");
			}
		} else {
			var htmlCode = '<div id="'+fileName+'" onclick="switchProgram(\''+fileName+'\')" class="program tableCol"><p id="'+fileName+'Text" class="tableCol">'+fileName+'</p><i id="'+fileName+'Close" onclick="closeProgram(\''+fileName+'\')" class="fa fa-times tabelCol"></i></div>';
	    	$('#programsList').append(htmlCode);
	    	listOfPrograms[fileName] = "";
	    	switchProgram(fileName);
		}
	}
   // listOfPrograms[fileName] = getEditorText();

}

// displays the next program on the list
function openNextProgram() {
	$('#' + Object.keys(listOfPrograms)[0]).addClass("selectedProgram");
	currentProgram = Object.keys(listOfPrograms)[0];
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

function renamePassoff(id) {
	listOfPrograms[id] = getEditorText();
	delete listOfPrograms[currentProgram];	
	currentProgram = id;
}

function switchProgram(id) {

	if(Object.keys(listOfPrograms).indexOf(id) > -1) {
			if((currentProgram != "") || (currentProgram != undefined)) {
			if(currentProgram != undefined) {
				quickSaveFile(currentProgram);
			}
		}
		unselectProgram(currentProgram);
		selectProgram(id);
		currentProgram = id;
		//console.log("switch: " + id);
	
	} else {
	}
}

function unselectProgram(id) {
	if (id != "")
		$('#' + id).removeClass("selectedProgram");
}

function selectProgram(id) {
	//console.log('select program');
	$('#' + id).addClass("selectedProgram");
	quickLoadFile(id);
}


function fullScreen() {
	if (isFullscreen)
		removeFullScreen();
	else {
		makeFullScreen();
	}
}

function makeFullScreen() {
	isFullscreen = true;
	localStorage.setItem("fullScreen", "true");
	$('.header').hide();
	$('.footer').hide();
	$('#menu').prependTo('#utilityBar');
	$('#content').css("height", "calc(100vh - 50px)");
	$('#menuIconOpen').css("height", "50px");
	$('#menuIconOpen').css("padding-top", "15px");
}

function removeFullScreen() {
	isFullscreen = false;
		$('.header').show();
		$('.footer').show();
		$('#menu').prependTo('.header');
		$('#content').css("height", "calc(100vh - 190px)");
		$('#menuIconOpen').css("padding-top", "39px");
		$('#menuIconOpen').css("height", "100px");
		localStorage.setItem("fullScreen", "false");
}

function setFullScreenVariable() {
	isFullscreen = localStorage.getItem("fullScreen");
	console.log("hello");
	console.log(isFullscreen);
	if (isFullscreen == null)
		isFullScreen = false;
	else if (isFullscreen == "true")
		makeFullScreen();
	else
		removeFullScreen();
	localStorage.setItem("fullScreen", "true");
}