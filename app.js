var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');

passport.use(new Strategy(
  function(username, password, cb) {
      db.users.findByUsername(username, function(err, user) {

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
  db.users.findById(id, function (err, user) {
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
//проверка логина
app.post('/api/login', 
  passport.authenticate('local'),
  function(req, res) {
  	res.status('200');
  	res.end();
    //res.redirect('/');
  });

//получение всего справочника для пользователя
app.post('/api/handbook', 
  passport.authenticate('local'),
  function(req, res) {

  	 	db.users.handBook(req.user.handBookList, function (err, userList) {	
  		res.write(JSON.stringify(userList))
  		res.end();
  	});
  });

//полчение отдельной темы из справочника
app.post('/api/handbook/get', 
  passport.authenticate('local'),
  function(req, res) {
  		db.users.HandbookById(req.body.id, function (err, data) 
  		{	
  			if(data.length==0)
  				{res.status(204); res.end()}
  			else
  			{
  		res.end(JSON.stringify(data))
  			}
  		})
  	});

//получение всех пользователей для админа
app.post('/api/list', 
  passport.authenticate('local'),
  function(req, res) 
  {
  	try{
  		req.user.role=='admin'
  	 	db.users.userList( function (err, userList) 
  	 	{
  		res.write(JSON.stringify(userList))
  		res.end();
  		});
  		}
  		catch(e){res.status(404); res.end()}
  });

//получение тестов для пользователя
app.post('/api/testslist', 
  passport.authenticate('local'),
  function(req, res) {
  	var list =req.user.testslist.map(function(data) 
  	{return data.name;	})

  	 	db.users.tests(list, function (err, testslist) {	
  		res.write(JSON.stringify(testslist))
  		res.end();
  	});
  });


//получение списка тестов и оценки
app.post('/api/tests', 
  passport.authenticate('local'),
  function(req, res) {
  		res.write(JSON.stringify(req.user.testslist))
  		res.end();
  });



  		//db.users.userList( function (err, userList) {res.write(userList)

// Define routes.
app.get('/',
  function(req, res) {
  	try {

  		  		if(req.user==undefined)
  			res.redirect('/login');
  		req.user.role=='admin';
  		res.render('home', { user: req.user,role:req.user.role });

  	}
  	catch(e){res.render('home', { user: req.user });}
  });

app.get('/login',  function(req, res){    res.render('login');  });

app.get('/admin',  function(req, res)  { 	
  	try {
  		req.user.role=='admin';
  		db.users.userList( function (err, userList) {
res.render('admin', { user: req.user, userList:userList})
  });
  		
  		} catch(e) {
  					res.render('login');
  					}
  });


  app.post('/admin', 
  function(req, res) {
  	try {
  		req.user.role=='admin';
  		var query=Object.keys(req.body);
  		if(query[1]=='Удалить' && req.user.id!=query[0])
  		db.users.deleteUser(query[0]);
  		}
  		catch(e) {
  					res.render('login');
  				}
    res.redirect('/admin');
  });
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
  	
    res.render('profile', { user: req.user });
  });

app.post('/api/handBook/addHandBook',
	passport.authenticate('local'),
	function(req,res){
		db.users.addhandbook(req.body.name, req.body.text, function(err){
			if(err==null)
			 res.status(200);
			else res.status(409);
			res.end();
		});
	});

app.post('/api/tests/addTest',
	passport.authenticate('local'),
	function(req,res){
		db.users.addtest(req.body.name, req.body.list, function(err){
			if(err==null)
			 res.status(200);
			else res.status(409);
			res.end();
		});
	});

app.post('/api/handBook/delHandBook',
	passport.authenticate('local'),
	function(req,res){
		db.users.delhandbook(req.body.id, function(err){
			if(err==null)
			 res.status(200);
			else res.status(409);
			res.end();
		});
	});

app.post('/api/tests/delTest',
	passport.authenticate('local'),
	function(req,res){
		db.users.deltest(req.body.id, req.body.name, function(err){
			if(err==null)
			 res.status(200);
			else res.status(409);
			res.end();
		});
	});



app.use(express.static(__dirname + '/static'));
app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080,process.env.OPENSHIFT_NODEJS_IP);
