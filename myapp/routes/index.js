var express = require('express');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;
var router = express.Router();
var Users = require('../models/Users.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ENGR 1200' });
});

router.get('/code', function(req,res,next) {
	var array = req.query.inputList;
	var cin = req.query.cin;
	var outputText = " ";
	fs.writeFile("test.c", req.query.codeValue, function(err) {
		if(err) {
			console.log(err);
		}
	});
	var compile = spawn('g++', ["test.c"]);
	compile.stdout.on('data', function(data) {
		console.log("stdout: " + data);
	});
	compile.stderr.on('data', function (data) {
		console.log(String(data));
	});
	compile.on('close', function (data) {
		if(data ===0) {
			var run = spawn("./a.out", array);
			run.stdin.end(cin);
			run.stdout.on('data', function (output) {
				outputText += String(output) + "\n";
				console.log(String(output));
			});
			run.stderr.on('data', function (output) {
				console.log(String(output));
			});
			run.on('close', function(output) {
				console.log('stdout: '+ output);
				res.send(outputText);
			});
		}
	})
});

module.exports = router;
	
