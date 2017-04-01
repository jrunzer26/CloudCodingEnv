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
var randomString = require("randomstring");
var auth = new GoogleAuth;

var GoogleAuth = require('google-auth-library');
var client = new auth.OAuth2("814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com", '', '');

var router = express.Router();
var Users = require('../models/Users.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('index', { title: 'ENGR 1200' });
});

router.get('/application', function(req,res,next) {
	console.log("SUP");
})

router.get('/userType', function(req,res,next) {
	console.log("I am in the user type route ");
	Users.getUser(req.query.email, function(value) {
		if(value == null) {
			var firstName = req.query.email.substring(0, req.query.email.indexOf("."));
			var lastName = req.query.email.substring(req.query.email.indexOf(".")+1, req.query.email.indexOf("@"));
			Users.addUser(req.query.email,firstName, lastName, "Student", function() {
				res.send("Student");
			})
		} else {
			res.send(value.role);
		}
	});
});

router.get('/code', function(req,res,next) {
	var array = req.query.inputList;
	var cin = req.query.cin;
	var tempName = randomString.generate(7);
	var name = tempName + ".c";
	var outputText = " ";
	fs.writeFile(name, req.query.codeValue, function(err) {
		if(err) {
			console.log(err);
			//return res.send(err);
		}
	});
	var temper = tempName + ".out";
	var compile = spawn('g++', [name, "-o", temper]);
	compile.stdout.on('data', function(data) {
	});
	compile.stderr.on('data', function (data) {
		exec('rm '+temper);
		return res.send("While compiling your code an error occurred.\n"+String(data));
	});
	compile.on('close', function (data) {
		if(data ===0) {
			var temp = "./"+ name+ ".out";
			var run = spawn(temp, array);
			var timeout = false;
			setTimeout(function(){
				run.kill();
				timeout = true;
			}, 2000);
			run.stdin.end(cin);
			run.stdout.on('data', function (output) {
				outputText += String(output) + "\n";
			});
			run.stderr.on('data', function (output) {
				exec('rm '+temper);
				exec('rm '+name);
				return res.send("While running your code an error occurred.\n"+String(output));
			});
			run.on('close', function(output) {
				if(!timeout) {
					exec('rm '+temper);
					exec('rm '+name);
					return res.send(outputText);
				} else {
					exec('rm '+temper);
					exec('rm '+name);
					return res.send("Timeout error: your program took to long to run!");
				}
			});
		}
	})
});

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
		res.send(result);
	})
})

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
	
