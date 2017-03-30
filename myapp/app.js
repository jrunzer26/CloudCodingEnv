var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2("814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com", '', '');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');
var userLoggedIn = false;
var index = require('./routes/index');
var login = require('./routes/login');
var quiz = require('./routes/quiz');
var admin = require('./routes/admin');
var quiz_gen = require('./routes/quiz-gen');
var quiz_manager = require('./routes/quiz-manager');
var programs = require('./routes/programs');

var app = express();


app.get('/main', checkUser);
app.get('/quiz', checkUserSideRoutes);
app.get('/quiz-manager', checkUserSideRoutes)
app.get('/quiz-gen', checkUserSideRoutes);
app.get('/admin', checkUserSideRoutes);


function checkUserSideRoutes(req, res,next) {
	var token = req.param("param1");
	if(!userLoggedIn) {
		try {
	  		client.verifyIdToken(
	  			token,
	  			"814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com",
	  			function(e, login) {
	  				try{
	  					var payload = login.getPayload();
	  					var userid = payload['sub']
	  					userLoggedIn = true;
	  					next()
	  				} catch(err) {
	  					console.log("REDIRECTED");
	  					res.redirect('/')
	  				}
	  			}
	  		)
	  	} catch(e) {
	  		console.log("REDIRECTING");
	  		res.redirect('/')
	  	}
	} else {
		next()
	}
}



function checkUser(req, res,next) {
	var token = req.param("param1");
	userLoggedIn = false;
	try {
  		client.verifyIdToken(
  			token,
  			"814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com",
  			function(e, login) {
  				try{
  					var payload = login.getPayload();
  					var userid = payload['sub']
  					next()
  				} catch(err) {
  					console.log("REDIRECTED");
  					res.redirect('/')
  				}
  			}
  		)
  	} catch(e) {
  		console.log("REDIRECTING");
  		res.redirect('/')
  	}
}



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/main', index);
app.use('/', login);
app.use('/quiz', quiz);
app.use('/admin', admin);
app.use('/quiz-gen', quiz_gen);
app.use('/quiz-manager', quiz_manager);
app.use('/programs', programs);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
