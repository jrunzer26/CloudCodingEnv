var GoogleAuth;
var ENGRFolderId;
var existingFolders = [];
var editor;
var currentProgram;
var listOfPrograms = {};
var isFullscreen = false;

$(document).ready(function() {
	//Sends a request to the backend to see what type of user they are.
	$.ajax({
		type: 'GET',
		url: '/main/userType',
		data: {email: sessionStorage.getItem("email")},
		success: function(output) {
			console.log(output);
			sessionStorage.setItem("access", output);
			//If the user is a student hide the teacher elements.
			if(output == "Student") {
				document.getElementById('admin').style.display = 'none';
				$('#publish').hide();
			}

		}
	})
	//Gets all the instructor programs.
	getProgramList();
	setFullScreenVariable();

	$('#dialog').hide();
	$('#dialogClose').hide();
	$('#dialogPublish').hide();

	//Sets up the coding enviornment.
	var code = $(".codemirror-textarea")[0];
	editor = CodeMirror.fromTextArea(code, {
		lineNumbers : true,
		value: "function myScript(){return 100;}\n",
		mode: "text/x-c++src",
		theme: "default"
	});

	//Sends an ajax request to the server that will compile and run the code.
	$("#showText").click(function() {
		var text = editor.getValue();
		var fileName = "";
		var inputParams = $('#inputParams').val().split(",");
		var cinParams = $('#cinParams').val();
		var textValue = sessionStorage.getItem("email").replace(".","").split("@");
		//Formats the file name.
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
				//Display the results of the executed code.
				$('#outputOfCode').val(output);
			}
		})
	});

});

/**
 * A setter for the code enviornment.
 * @param {*} info
 */
function setEditorText(info){
	editor.setValue(info);
}

/**
 * A getter for the code environment.
 */
function getEditorText() {
	return editor.getValue();
}

/**
 * Dont think this has any purpose.
 */
function testFunction() {
	$.ajax({
		type: 'GET',
		url: '/main/auth',
		success: function(output) {
			console.log(output);
		}
	})
}

/**
 * Gets the id_token of the user when they sign in.
 * @param {*} googleUser
 */
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var id_token = googleUser.getAuthResponse().id_token;
  console.log(id_token);
}

/**
 * Signs the user out.
 */
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  }

/**
 * Closes the program.
 * @param {*} id 
 */
function closeProgram(id) {
	askSave(false);
}

/**
 * Closes the program when the user deletes it. 
 * @param {*} id 
 */
function closeDeletedProgram(id) {
	delete listOfPrograms[id];
	var elem = document.getElementById(id);
	elem.remove();
	openNextProgram();	
}

/**
 * Stores the tachers code on a database that can be accessed by the users.
 */
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

/**
 * When the user clicks the save button, it will ask the user if they are sure they want to save the file.
 * @param {*} val
 */
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

/**
 * Creates a new file that a user can work on.
 */
function newFile() {
	var fileName = window.prompt("Enter file name: ", "testFile");
	//Checks to see if that file already exists.
	if(fileName !== null) {
		if(Object.keys(listOfPrograms).indexOf(fileName) > -1) {
			var value = confirm("That file already exists! Do you wish to overwrite that file with an empty file?");
			if(value) {
				listOfPrograms[fileName] = "";
				editor.setValue("");
			}
		} else {
			//If the file does not exists, creates a new file with a tab.
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

/**
 * Before the user changes to a different tab, save the contents of the respective file in a key value pair list.
 * @param {*} id 
 */
function quickSaveFile(id) {
	listOfPrograms[id] = getEditorText();
}


/**
 * Load the file and it's repective code to the coding enviornment. 
 * @param {*} id 
 */
function quickLoadFile(id) {
	if(listOfPrograms[id]) {
		editor.setValue(listOfPrograms[id]);
	} else {
		editor.setValue("");
	}
}

/**
 * When changing the name, store the new name in the list and pass off the code to the new name, and delete the old name from the list.
 * @param {*} id 
 */
function renamePassoff(id) {
	listOfPrograms[id] = getEditorText();
	delete listOfPrograms[currentProgram];	
	currentProgram = id;
}

/**
 * Changes the program that is displayed to the user.
 * @param {*} id 
 */
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
	}
}


/**
 * Unhighlights a program.
 * @param {*} id 
 */
function unselectProgram(id) {
	if (id != "" && id)
		$('#' + id.replace('.cpp', '\\.cpp')).removeClass("selectedProgram");
	console.log(id);
}

/**
 * Selects a program when clicked by highlighting and loading the file into the editor.
 * @param {*} id 
 */
function selectProgram(id) {
	$('#' + id.replace('.cpp', '\\.cpp')).addClass("selectedProgram");
	quickLoadFile(id);
}

/**
 * Toggles fullscreen mode.
 */
function fullScreen() {
	if (isFullscreen)
		removeFullScreen();
	else {
		makeFullScreen();
	}
}

/**
 * Changles HTML elements to make the coding env full screen.
 */
function makeFullScreen() {
	console.log("fullscreen");
	isFullscreen = true;
	localStorage.setItem("fullScreen", "true");
	$('.header').hide();
	$('.footer').hide();
	$('#menu').prependTo('#utilityBar');
	$('#content').css("height", "calc(100vh - 50px)");
	$('#menuIconOpen').css("height", "50px");
	$('#menuIconOpen').css("padding-top", "15px");
}

/**
 * Modifys HTML elements to put the env back to normal mode. 
 */
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

/**
 * Sets the fullscreen variable, if null isFullscreen = false. 
 * Also restores fullscreen session
 */
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