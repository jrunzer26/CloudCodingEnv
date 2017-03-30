/**
 * Gets a program from the server.
 * @param {*} programName 
 */
function getProgram(programName) {
  $.ajax({
    type: 'POST',
    data: {programName: programName},
    url: '/programs/getProgram',
    success: function(output) {
      var htmlCode = '<div id="'+programName+'" onclick="switchProgram(\''+programName+'\')" class="program tableCol"><p id="'+programName+'Text" class="tableCol">'+programName+'</p><i id="'+programName+'Close" onclick="closeProgram(\''+programName+'\')" class="fa fa-times tabelCol"></i></div>';
      $('#programsList').append(htmlCode);
      listOfPrograms[programName] = output.data;
      switchProgram(programName);
    }
  });
}

/**
 * Gets the program list of instructor programs.
 */
function getProgramList() {
   $.ajax({
    type: 'GET',
    url: '/programs/listPrograms',
    success: function(output) {
      console.log("program list");
      for(var i = 0; i < output.programs.length; i++) {
        var listhtmlCode = '<a href="#" id="instrList'+output.programs[i].name+'" onclick=getProgram(\''+output.programs[i].name+'\') style="padding-left: 50px">'+output.programs[i].name+'</a>';
        $('#instrPrograms').append(listhtmlCode);
      }
    }
  });
}

/**
 * Saves a program to the server.
 * @param {*} programName 
 * @param {*} programText 
 */
function saveProgram(programName, programText) {
  var emailAdd = sessionStorage.getItem('email');
  if(emailAdd == undefined) {
    emailAdd = "jason.runzer@uoit.net"
  }
   $.ajax({
    type: 'POST',
    data: {email: emailAdd, programName: programName, data: programText},
    url: '/programs/saveProgram',
    success: function(output) {
      console.log(output);
      return output;
    }
  });
}

/**
 * Deletes a program from the server.
 * @param {*} programName 
 */
function deleteProgram(programName) {
    var emailAdd = sessionStorage.getItem('email');
    if(emailAdd == undefined) {
      emailAdd = "jason.runzer@uoit.net"
    }
   $.ajax({
    type: 'POST',
    data: {email: "jason.runzer@uoit.net", programName: programName},
    url: '/programs/deleteProgram',
    success: function(output) {
      console.log(output);
      return output;
    },
    error: function(output) {
      console.log("failed to delete");
      return output;
    }
  });
}