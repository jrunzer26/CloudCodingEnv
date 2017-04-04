var express = require('express');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var readline = require('readline');
var google = require('googleapis');
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2("814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com", '', '');
var rp = require('request-promise');

var auth = new GoogleAuth;

var GoogleAuth = require('google-auth-library');
var client = new auth.OAuth2("814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com", '', '');

var router = express.Router();
var Users = require('../models/Users.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('index', { title: 'ENGR 1200' });
});

/* GET user Role */
router.get('/userType', function(req,res,next) {
	console.log("I am in the user type route ");
	Users.getUser(req.query.email, function(value) {
		//If the user does not exist in the database.
		if(value == null) {
			var firstName = req.query.email.substring(0, req.query.email.indexOf("."));
			var lastName = req.query.email.substring(req.query.email.indexOf(".")+1, req.query.email.indexOf("@"));
			//Add the new user to the database.
			Users.addUser(req.query.email,firstName, lastName, "Student", function() {
				return res.send("Student");
			})
		} else {
			//Send the role of the user back to the frontend.
			return res.send(value.role);
		}
	});
});

/* GET the output of the code */
router.get('/code', function(req,res,next) {
	var array = req.query.inputList;
	var cin = req.query.cin;
	var name = req.query.fileName;
	var outputText = " ";
	var compileError = false; 
	var errorMessage = "";
	//Creates a file with the name passed in.
	fs.writeFile(name, req.query.codeValue, function(err) {
		//return if there was an error 
		if(err) {
			return res.send(err);
		} else {
			//If their was no error in creating a file, start compiling the code.
			var temper = name.slice(0, name.indexOf("_")) + ".out";

			//Create a process that will compile the code.
			var compile = spawn('g++', [name, "-o", temper]);
			compile.stdout.on('data', function(data) {
			});

			//If their was an error compiling stored all the error messages in the errorMessage variable.
			compile.stderr.on('data', function (data) {
				compileError = true;
				errorMessage += String(data);
			});

			//When the file is done being compiled, enter this statement.
			compile.on('close', function (data) {
				if(data ===0) {
					var temp = "./"+ name.slice(0, name.indexOf("_")) + ".out";
					//Create another process on the server that will execute the code.
					var run = spawn(temp, array);
					var timeout = false;
					//Set a timeout incase of programs that never end.
					setTimeout(function(){
						run.kill();
						timeout = true;
					}, 2000);

					//Pipe in the input into the program
					run.stdin.end(cin);
					//Store the output into a string, that will be displayed to the user.
					run.stdout.on('data', function (output) {
						outputText += String(output) + "\n";
					});
					//If an error occurs during the execution of code return it to the user.
					run.stderr.on('data', function (output) {
						//Delete the files from the server.
						exec('rm '+temper);
						exec('rm '+name);
						return res.send("While running your code an error occurred.\n"+String(output));
					});
					//When the code is done running return the output of the code.
					run.on('close', function(output) {
						if(!timeout) {
							//Delete the files from the server.
							exec('rm '+temper);
							exec('rm '+name);
							return res.send(outputText);
						} else {
							//Delete the files from the server.
							exec('rm '+temper);
							exec('rm '+name);
							return res.send("Timeout error: your program took to long to run!");
						}

					});
				} else {
					while(1) {
						//When all the compile error data is gathered return it to the frontend.
						if(compileError) {
							exec('rm '+name);
							return res.send(errorMessage);	
						}
					}
				}
			})
		}
	});
	
});

/* GET the file contents. */
router.get('/getFile', function(req,res,next) {
	var token = req.query.token;
	var url = req.query.url;
	var options = {
		uri: url,

		headers: {
			'Authorization': 'Bearer '+ token
		}
	};
	rp(options).then(function (result) {
		return res.send(result);
	})
})

/* DONT THINK THIS IS USED */
router.get('/auth', function(req,res,next) {
	client.verifyIdToken(
    req.query.token,
    "814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com",
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
    function(e, login) {
      var payload = login.getPayload();
      var userid = payload['sub'];
      // If request specified a G Suite domain:
      //var domain = payload['hd'];
    });
})

module.exports = router;
	
