const http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      express     =require('express'),
      env          = process.env;
var app = express();

const passport = require('passport')  
const session = require('express-session')  
const RedisStore = require('connect-redis')(session)

app.use(session({  
  store: new RedisStore({
    url: config.redisStore.url
  }),
  secret: config.redisStore.secret,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())  
app.use(passport.session())  




app.use(express.responseTime());

app.use(express.compress());
app.use(express.static('static'));

app.use('/',function(r,t){ t.write('Страница не найдена');t.end()})
//app.use(404);
app.listen(3000, function() {
//app.listen(env.OPENSHIFT_NODEJS_PORT || 8080,env.OPENSHIFT_NODEJS_IP, function() {
  console.log(`Application worker ${process.pid} started...`);
});

