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
      console.log(output);
      return output;
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
        console.log(output.programs[i].name);
      }
      return output;
    }
  });
}

/**
 * Saves a program to the server.
 * @param {*} programName 
 * @param {*} programText 
 */
function saveProgram(programName, programText) {
   $.ajax({
    type: 'POST',
    data: {email: "jason.runzer@uoit.net", programName: programName, data: programText},
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