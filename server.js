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
    console.log("/로 get요청 -> index.html로 예쁘게 꾸민 페이지(/) 열어줌")
    응답.sendFile(__dirname+'/index.html');
});

app.get('/write', function(요청, 응답){
    console.log("/write로 get요청 -> write.html로 예쁘게 꾸민 페이지(/write) 열어줌")
    응답.sendFile(__dirname+'/write.html');
});

// 어떤 사람이 /add 경로로 POST 요청을 하면
// 데이터 2개(날짜, 제목)를 보내주는데,
// 이 때, 'post'라는 이름을 가진 collection에 두 개 데이터를 저장하기
app.post('/posts', function(요청,응답){///////////////////////////
    응답.send('클라이언트에서 서버로 데이터 전송완료'); // 빠지면 안됨. 브라우저 멈춤.
    console.log("/add로 post요청 -> 안꾸며진 페이지(/add) 열어줌 & db(counter)의 데이터 수정하고 & db(post)에 오브젝트 형식으로 데이터 보내 생성함")
    console.log(요청.body);
    console.log(요청.body.title);
    console.log(요청.body.date);
    //DB에 저장해주세요
    db.collection('counter').findOne({name: '게시물개수'}, function(에러, 결과){
        console.log(결과.totalPost);
        var 총게시물개수 = 결과.totalPost; //없어도 되낭?
        db.collection('post').insertOne({_id: 총게시물개수+1, 제목: 요청.body.title, 날짜: 요청.body.date}, function(){
            console.log('write 폼에 적은 내용 db에 저장 완료');
            //  +counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야함.
            db.collection('counter').updateOne({name: '게시물개수'}, { $inc : {totalPost:1} }, function(에러, 결과){
                 console.log('db의 총게시물개수 1증가 완료')
               if (에러) { return console.log(에러) }
             });
        });
    });
});

// /list로 GET요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
app.get('/posts', function(요청, 응답){
    //디비에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요.
    //html 보여주는 것보다 데이터 꺼내는게 먼지임! (순서 주의)
    db.collection('post').find().toArray(function(에러, 결과){
        console.log("/list로 get요청 -> db(post)에 있는 데이터 담은 list.ejs로 예쁘게 꾸민 페이지(/list) 열어줌")
        console.log("db(post)에서 가져온 거 결과 출력하면 아래와 같음")
        console.log(결과);
        응답.render('list.ejs', { posts : 결과 });
    });
});

// app.delete('/delete', function(요청, 응답){
//     console.log("/delete로 delete요청 -> 응답으로 페이지 안열어주고 status 메시지 보냄 & _id값으로 요청한 데이터를  db(post)에서 삭제함")
//     console.log(요청.body);
//     요청.body._id = parseInt(요청.body._id);
//     //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
//     db.collection('post').deleteOne( 요청.body, function(에러, 결과){
//         console.log('삭제완료');
//        응답.status(204).send({message: '삭제 성공했습니다'});
//     });
// });

app.delete('/posts/:id', function(요청, 응답){
    console.log("/posts/:id로 delete요청 -> 응답으로 페이지 안열어주고 status 메시지 보냄 & _id값으로 요청한 데이터를 db(post)에서 삭제함")
    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
    console.log(요청.params.id);
    db.collection('post').deleteOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
        console.log('삭제완료');
        응답.status(204).send({message: '삭제 성공했습니다'});
    });
});

// /detail2로 접속하면 detail2.ejs 보여줌
// /detail4로 접속하면 detail4.ejs 보여줌
// 간략화

app.get('/posts/:id', function(요청, 응답){
    console.log("");
    db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('detail.ejs', { data: 결과 });
    })
});