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
      {console.log(name);
        //доделать удаление отчетов удаленных тестов
        console.log(docs);
        if(err) cb(err);
        else
        {
        	docs.map(function(i, y, docs){
        		var undel = i.testslist.filter(function(x){
        			if(x.name==name)
        				return false;
        			else
        				return true;
        		});
        		i.testslist=undel;

        		users.update({_id:i._id},{$set:{testslist: i.testslist}}, {multi:true}, function(err, number){
        			if(err) cb(err);
        		});
        	});

          
          cb(null);
        }
      }
    );
      
  });
}


//загрузка всех тестов для пользователя
exports.tests = function(cb) 
{
  process.nextTick(function() 
  {
    tests.find({}, function (err, docs) 
    {
          cb(null,docs);
    });
  })
}

//прохождение тестов
exports.prohodtests = function(id, name, title, answer, cb) 
{
  process.nextTick(function() 
  {
  	//поиск теста в данных пользователя,обновление базы данных ответов пользователя
  	users.find({_id: id}, function (err, docs)
  	{
  		if(err) cb(err);
        else
        {
        	if(docs.length == 0){
        		cb(err);
        	}
        	else
        	{
            var y=0;
        		docs.map(function(i1, y1, docs){
        		i1.testslist.map(function(i2, y2, docs2){

        			if(i2.name == name){
                y=1;
        				i2.list.map(function(i3, y3, docs3){
        					if(i3.title == title){
                    y=2;
                    i3.answer=answer
                    users.update({_id:docs[0]._id},{ $set: {testslist:docs[0].testslist}})
        					}
        				})
                if(y==1) {
                    if(i2.name==name) {i2.list.push({title:title,answer:answer})
                      users.update({_id:docs[0]._id},{ $set: {testslist:docs[0].testslist}})
                  }}
                                }});
              if(y==0) users.update({_id:docs[0]._id},{ $push: {testslist:{name:name,list:[{title:title,answer:answer}],value:''}}},function(err)
                {if(err)cb(err)})
        		});
        	}
        }
        cb(null,docs);
  	});
  	
    
  });
}

//проверка тестов

exports.provtests = function(id, idTest, cb) 
{
  process.nextTick(function() 
  {
    var t=0;
    var ti=0;
   users.find({_id: id}, function (err, docs) 
    {
      tests.find({_id:idTest},function (err1, docst)
      {
        
        docs[0].testslist.map(function(i,y,d){
          if(i.name==docst[0].name){

              t=0;
              ti=0;
            for(var ii=0;ii!=docst[0].list.length;ii++)
            {
              ti++;

              if(docst[0].list[ii].answer==i.list[ii].answer)
                t++;
                            console.log(docst[0].list[ii].answer);console.log(i.list[ii].answer);
            }

            
            i.value=(t/ti).toFixed(2);

            t=i.value;

          }
        })


        users.update({_id: id},{$set: {testslist:docs[0].testslist}})
        //console.log(t)
        cb(err,t);

      })
    })
  })
}
/*

    	console.log(docs[0]);

    	var count=0;

    	for(var i=0;i<docs[0].list.length;i++)
    	{
    		console.log(docs[0].list[i].title);
    		if(docs[0].list[i].title == title)
    		{
    			var otv = docs[0].list[i].answer;
    			break;
    		}
    	}
    	console.log(count);
      console.log(otv);
      if(otv == answer)
      {
      	count++;
      }
      //вычисляем оценку
      //...
      

          cb(null,docs);
    });
  })
}

*/



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