var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');

passport.use(new Strategy(
  function(username, password, cb) {
      db.findByUsername(username, function(err, user) {

      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }

      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});


passport.deserializeUser(function(id, cb) {
  db.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('short'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'rt32.%23_g54!', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());



// API для приложения
//аудентификация пользователя
app.post('/api/login', 
  passport.authenticate('local'),
  function(req, res) {
  	res.status('200');
  	res.end();
  });

//выход пользователя
app.post('/api/logout',
  function(req, res){
    req.logout();
    res.end();
  });


//получение всего справочника
app.post('/api/handbook', 
  function(req, res) {
  	 	db.handBook(function (err, handbook) {	
  		res.write(JSON.stringify(handbook))
  		res.end();
  	});
  });


//получение всех пользователей для админа
app.post('/api/list', 
  function(req, res) 
  {
  	try{
  		req.user.role=='admin'
  	 	db.userList( function (err, userList) 
  	 	{
  		res.write(JSON.stringify(userList))
  		res.end();
  		});
  		}
  		catch(e){res.status(404); res.end()}
  });

//получение тестов для пользователя
app.post('/api/testslist', 
  function(req, res) {
  	var list =req.user.testslist.map(function(data) 
  	{return data.name;	})

  	 	db.tests(list, function (err, testslist) {	
  		res.write(JSON.stringify(testslist))
  		res.end();
  	});
  });


//получение списка тестов и оценки
app.post('/api/tests', 
  function(req, res) {
  		res.write(JSON.stringify(req.user.testslist))
  		res.end();
  });

  		//db.userList( function (err, userList) {res.write(userList)

app.post('/api/handBook/addHandBook',
	function(req,res){
		db.addhandbook(req.body.name, req.body.text, function(err){
			if(err==null)
			 res.status(200);
			else res.status(409);
			res.end();
		});
	});

app.post('/api/tests/addTest',
	function(req,res){
		db.addtest(req.body.name, req.body.list, function(err){
			if(err==null)
			 res.status(200);
			else res.status(409);
			res.end();
		});
	});

app.post('/api/handBook/delHandBook',
	function(req,res){
		db.delhandbook(req.body.id, function(err){
			if(err==null)
			 res.status(200);
			else res.status(409);
			res.end();
		});
	});

app.post('/api/tests/delTest',
	function(req,res){
		db.deltest(req.body.id, req.body.name, function(err){
			if(err==null)
			 res.status(200);
			else res.status(409);
			res.end();
		});
	});
app.use(express.static(__dirname + '/static'));
app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080,process.env.OPENSHIFT_NODEJS_IP);
