const express=require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
const session = require('express-session');
const res = require('express/lib/response');

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));

var passport = require('./lib/passport')(app);

app.use('/', require('./routes/index.js'));
app.use('/posts', require('./routes/posts.js'));
app.use('/auth', require('./routes/auth.js')(passport));
//app.use -> 미들웨어 쓰고 싶을 때 씀.*요청과 응답 사이에 실행하고 싶은 코드)

require('dotenv').config();

var db;
MongoClient.connect(process.env.DB_URL
,{ useUnifiedTopology: true },function(에러,client){
    if (에러) return console.log(에러);
    db = client.db('todoapp');
    app.db=db;
    app.listen(process.env.PORT, function(){
    console.log('listening on 8080')
    });
});





  

