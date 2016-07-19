var path = require('path');
var Nedb = require('nedb')
  , users = new Nedb({ filename: 'db/users.db'})
  , handbook = new Nedb({ filename: 'db/handbook.db'})
  , tests = new Nedb({ filename: 'db/tests.db'})
users.loadDatabase(function(err) {if(err)console.error('Ошибка загрузки базы данных пользователей:'+err)  });
handbook.loadDatabase(function(err) {if(err)console.error('Ошибка загрузки базы данных справочника:'+err)  });
tests.loadDatabase(function(err) {if(err)console.error('Ошибка загрузки базы данных тестов:'+err)  });

//tests.insert({name:"test2", list:[{title:"Вопрос первый второго теста", text:"это был простой вопрос", image:"0", response:["вариант 1","вариант 2", "вариант 3"]},{title:"Второй вопрос второго теста", text:"еще один вопрос без картинки", image:"0", response:["a","b", "c"]}]});

// загрузка всех пользователей для админа
exports.userList = function(cb) 
{
  process.nextTick(function() 
  {
          users.find({}, function (err, docs) 
          {
            cb(null, docs);
          });
  });
}



exports.deleteUser= function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    delete records[idx];
  });
}

// нахождение по id
exports.findById = function(id, cb) {
  process.nextTick(function() {
   users.find({_id:id }, function (err, docs){

    if (docs[0]._id) {
      cb(null,docs[0]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
})
}

//нахождение по логину
exports.findByUsername = function(username, cb) 
{
 
  process.nextTick(function() 
  { 
    users.find({username:username }, function (err, docs) 
      {
          try {
            if (docs[0].username === username) 
            {   
             cb(null, docs[0]);
            }else{
             cb(null, null);
            }
              } catch(e) {
            cb(null, null);
          }
      });
  })
}

//загрузка всего справочника 
exports.handBook = function(cb) 
{
  process.nextTick(function() 
  {
    handbook.find({}, function (err, docs) 
    {
          cb(null,docs);
    });
  })
}
//добавление справочника
exports.addhandbook = function(name, text, cb)
{
  process.nextTick(function()
  {
    handbook.insert({ header: name, text: text, image: '0' }, function(err)
      {
        if(err) cb(err);
        else cb(null);
      }
    );
  });
}

//удаление справочника
exports.delhandbook = function(id, cb)
{
  process.nextTick(function()
  {
    handbook.remove({ _id: id }, function(err)
      {
        if(err) cb(err);
        else cb(null);
      }
    );
  });
}



//тесты

//добавление теста
exports.addtest = function(name, list, cb)
{
  process.nextTick(function()
  {
    tests.insert({name: name, list: list}, function(err)
      {
        if(err) cb(err);
        else cb(null);
      }
    );
  });
}



//удаление теста
exports.deltest = function(id, name, cb)
{
  process.nextTick(function()
  {
    /*tests.remove({ _id: id },{}, function(err)
      {
        if(err) cb(err);
        else cb(null);
      }
    );*/
    users.find({"testslist.name":name}, function(err, docs)
      {
        //доделать удаление отчетов удаленных тестов
        console.log(docs);
        if(err) cb(err);
        else
        {//ниработаит
          console.log(docs[0].testslist.name)
          users.remove({"testslist.name":docs[0].testslist.name}, function(err)
            {
              if(err) cb(err);
              else cb(null);
            });
          cb(null);
        }
      }
    );
      
  });
}


//загрузка всех тестов для пользователя
exports.tests = function(list,cb) 
{
  process.nextTick(function() 
  {
    tests.find({name:{$in:list}}, function (err, docs) 
    {
          cb(null,docs);
    });
  })
}









/*
var nedb = require('nedb')
  , users = new nedb({ filename: path.join(__dirname, '../Data', 'DataB.db'), autoload: true });



var Nedb = require('nedb')
  , users = new Nedb({ filename: 'db/data.db', autoload: true });


  exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

//users.insert({ name: 'Earth', satellites: 1 }, function (err) {
//  users.insert({ name: 'Mars', satellites: 2 }, function (err) {
 //   users.insert({ name: 'Jupiter', satellites: 67 }, function (err) {
      
      //users.find({ satellites: { $lt: 10 } }, function (err, docs) {
 //     });
//    });
//  });
//});*/