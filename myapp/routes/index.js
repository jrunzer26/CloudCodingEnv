var express = require('express');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;
var readline = require('readline');
var google = require('googleapis');
var GoogleAuth = require('google-auth-library');
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

router.get('/code', function(req,res,next) {
	var array = req.query.inputList;
	var cin = req.query.cin;
	var name = req.query.fileName;
	var outputText = " ";
	fs.writeFile(name, req.query.codeValue, function(err) {
		if(err) {
			console.log(err);
		}
	});
	var temper = name.slice(0, name.indexOf("_")) + ".out";
	var compile = spawn('g++', [name, "-o", temper]);
	compile.stdout.on('data', function(data) {
		console.log("stdout: " + data);
	});
	compile.stderr.on('data', function (data) {
		res.send("While compiling your code an error occurred.\n"+String(data));
	});
	compile.on('close', function (data) {
		if(data ===0) {
			var temp = "./"+ name.slice(0, name.indexOf("_")) + ".out";
			var run = spawn(temp, array);
			run.stdin.end(cin);
			run.stdout.on('data', function (output) {
				outputText += String(output) + "\n";
				console.log(String(output));
			});
			run.stderr.on('data', function (output) {
				res.send("While running your code an error occurred.\n"+String(output));
			});
			run.on('close', function(output) {
				console.log('stdout: '+ output);
				res.send(outputText);
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
	
