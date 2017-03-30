var db = require('../db.js');

/**
 * Gets the user from the database.
 */
exports.getUser = function(email, callback) {
  db.any('SELECT * FROM Users WHERE email = $1;', [email])
  .then(function(data) {
    console.log(data);
    if (data.length > 0)
      return callback(data[0]);
    else
      return callback(null);
      return null;
  })
  .catch(function(err) {
    console.log(err);
  });
}

/**
 * Adds a user to the database.
 */
exports.addUser = function(email, firstName, lastName, role, callback) {
  db.none('INSERT INTO Users VALUES($1, $2, $3, $4);', [email, firstName, lastName, role])
    .then(function() {
      console.log('success');
      callback();
    })
    .catch(function(err) {
      console.log(err);
    });  
}