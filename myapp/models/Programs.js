var db = require('../db.js');

/**
 * Gets the user from the database.
 */
exports.getProgram = function(programName, callback) {
  db.any('SELECT * FROM Programs WHERE "name" = $1;', [programName])
  .then(function(data) {
    if (data.length > 0)
      return callback({status: 200, data: data[0]});
    else
      return callback({status: 400, data: ""});
  })
  .catch(function(err) {
    console.log(err);
    return callback({status:400, data: ""});
  });
}

/**
 * Adds a program to the database.
 */
exports.saveProgram = function(programName, data, callback) {
  db.none(
    'INSERT INTO Programs ("name", "data") VALUES($1, $2) ' +
    'ON CONFLICT ("name") DO UPDATE SET "data" = $2;     ', 
    [programName, data])
    .then(function() {
      callback({status: 200, success: "Saved program: " + programName});
    })
    .catch(function(err) {
      console.log(err);
      callback({status: 400});
    });  
}

/**
 * Deletes a program.
 */
exports.deleteProgram = function(programName, callback) {
  db.none('DELETE FROM Programs WHERE "name" = $1;', [programName])
  .then(function() {
    callback({status: 200, success: 'deleted program: ' + programName});
  })
  .catch(function(err) {
    console.log(err);
    callback({status: 400, success: 'failed to delete: ' + programName});
  });
}

/**
 * Retrieves the list of programs.
 */
exports.listPrograms = function(callback) {
  db.any('SELECT "name" FROM Programs;')
  .then(function(data) {
    return callback({status: 200, programs: data});
  })
  .catch(function(err) {
    console.log(err);
    return callback({status: 400, programs: []});
  });
}