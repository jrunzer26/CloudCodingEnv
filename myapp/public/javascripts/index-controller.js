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

/**
 * Closes the program tab.
 * @param {*} id the id of the program
 */
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

/**
 * Switches programs when a program tab is clicked.
 * @param {*} id 
 */
function switchProgram(id) {
	unselectProgram(currentProgram);
	selectProgram(id);
	currentProgram = id;
	console.log("switch: " + id);
}

/**
 * Unselects the program provided.
 * @param {*} id 
 */
function unselectProgram(id) {
	if (id != "")
		$('#' + id).removeClass("selectedProgram");
}

/**
 * Selects the program provided.
 * @param {*} id 
 */
function selectProgram(id) {
	console.log('select program');
	$('#' + id).addClass("selectedProgram");
	// set codemirror text not working
	editor.setValue('cout << "otherProgram" endl;');
}