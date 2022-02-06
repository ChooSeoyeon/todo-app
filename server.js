const express=require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

var db;
MongoClient.connect('mongodb+srv://admin:qwer4321@cluster0.u0p2o.mongodb.net/todoapp?retryWrites=true&w=majority'
,{ useUnifiedTopology: true },function(에러,client){
    if (에러) return console.log(에러);

    db = client.db('todoapp');
    // db.collection('post').insertOne( {이름 : 'Choo', _id:2} , function(에러, 결과){
	//     console.log('저장완료'); 
	// });
    app.listen(8080, function(){
    console.log('listening on 8080')
    });
});

// 누군가가 /pet 으로 방문을 하면..
// pet관련된 안내문을 띄어주자
// app.get('/pet', function(요청, 응답){
//     응답.send('펫 용품 쇼핑할 수 있는 페이지입니다.');
// }); 

// app.get('/beauty', function(요청, 응답){
//     응답.send('뷰티 용품 쇼핑할 수 있는 페이지입니다.');
// });

app.get('/', function(요청, 응답){
    응답.sendFile(__dirname+'/index.html');
});

app.get('/write', function(요청, 응답){
    응답.sendFile(__dirname+'/write.html');
});

// 어떤 사람이 /add 경로로 POST 요청을 하면
// 데이터 2개(날짜, 제목)를 보내주는데,
// 이 때, 'post'라는 이름을 가진 collection에 두 개 데이터를 저장하기
app.post('/add', function(요청,응답){
    응답.send('전송완료'); // 빠지면 안됨. 브라우저 멈춤.
    // console.log(요청.body);
    // console.log(요청.body.title);
    // console.log(요청.body.date);
    //DB에 저장해주세요
    db.collection('counter').findOne({name: '게시물개수'}, function(에러, 결과){
        console.log(결과.totalPost);
        var 총게시물개수 = 결과.totalPost;
        db.collection('post').insertOne({_id: 총게시물개수+1, 제목: 요청.body.title, 날짜: 요청.body.date}, function(){
            console.log('저장완료');
            //  +counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야함.
             db.collection('counter').updateOne({name: '게시물개수'}, { $inc : {totalPost:1} }, function(에러, 결과){
                if (에러) { return console.log(에러) }
             });
        });
    });
});

// /list로 GET요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
app.get('/list', function(요청, 응답){
    //디비에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요.
    //html 보여주는 것보다 데이터 꺼내는게 먼지임! (순서 주의)
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        응답.render('list.ejs', { posts : 결과 });
    });
});
