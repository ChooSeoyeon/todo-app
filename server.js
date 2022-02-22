const express=require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const res = require('express/lib/response');

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

require('dotenv').config();

var db;
MongoClient.connect(process.env.DB_URL
,{ useUnifiedTopology: true },function(에러,client){
    if (에러) return console.log(에러);
    db = client.db('todoapp');
    app.listen(process.env.PORT, function(){
    console.log('listening on 8080')
    });
});

app.get('/',function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/로 get요청 -> index.ejs로 예쁘게 꾸민 페이지(/) 열어줌")
    응답.render('index.ejs');
});

app.get('/write', 로그인했니, function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/write로 get요청 -> write.ejs로 예쁘게 꾸민 페이지(/write) 열어줌")
    응답.render('write.ejs');
});

// 어떤 사람이 /posts 경로로 POST 요청을 하면
// 데이터 2개(날짜, 제목)를 보내주는데,
// 이 때, 'post'라는 이름을 가진 collection에 두 개 데이터를 저장하기
app.post('/posts', 로그인했니, function(요청,응답){
    응답.send('클라이언트에서 서버로 데이터 전송완료'); // 빠지면 안됨. 브라우저 멈춤.
    console.log("---------------------------------------");
    console.log("/posts로 post요청 -> 안꾸며진 페이지(/posts) 열어줌 & db(counter)의 데이터 수정하고 & db(post)에 오브젝트 형식으로 데이터 보내 생성함")
    console.log(요청.body);
    console.log(요청.body.title);
    console.log(요청.body.date);
    console.log(요청.user._id);
    console.log(요청.user.id);
    console.log(요청.user.pw);
    //DB에 저장해주세요 

    db.collection('counter').findOne({name: '게시물개수'}, function(에러, 결과){
        console.log(결과.totalPost);
        var 총게시물개수 = 결과.totalPost; //없어도 되낭?

        var 저장할거 = {_id: 총게시물개수+1, 제목: 요청.body.title, 날짜: 요청.body.date, 작성자:요청.user._id, 아이디:요청.user.id }
        db.collection('post').insertOne( 저장할거, function(){
            console.log('write 폼에 적은 내용 db에 저장 완료');
            //  +counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야함.
            db.collection('counter').updateOne({name: '게시물개수'}, { $inc : {totalPost:1} }, function(에러, 결과){
               console.log('db의 총게시물개수 1증가 완료')
               if (에러) { return console.log(에러) }
             });
        });
    });
});


// /posts로 GET요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
app.get('/posts', 로그인했니, function(요청, 응답){
    //디비에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요.
    //html 보여주는 것보다 데이터 꺼내는게 먼지임! (순서 주의)
    console.log("---------------------------------------");
    db.collection('post').find({아이디:요청.user.id}).toArray(function(에러, 결과){
        console.log("/posts로 get요청 -> db(post)에 있는 데이터 담은 list.ejs로 예쁘게 꾸민 페이지(/posts) 열어줌")
        console.log("db(post)에서 가져온 거 결과 출력하면 아래와 같음")
        console.log(결과);
        console.log(요청.user);
        응답.render('list.ejs', { posts : 결과, 사용자: 요청.user});
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
app.delete('/posts/:id', 로그인했니, function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/posts/:id로 delete요청 -> 응답으로 페이지 안열어주고 status 메시지 보냄 & url 속 숫자로 요청한 데이터를 db(post)에서 삭제함")
    console.log(요청.params.id);
    console.log(요청.user._id);  //id로 해도 되나??
    var 삭제할데이터 = {_id: parseInt(요청.params.id), 작성자: 요청.user._id}
    db.collection('post').deleteOne( 삭제할데이터, function(에러, 결과){
        console.log('삭제완료'); //실패했을떄도 뜸 ㅠㅠ 고쳐야할듯
        //if(결과) {console.log(결과)};//몇 개 삭제됐는지 뜸
        응답.status(200).send({message: '삭제 성공했습니다'});
    });
});

// /detail2로 접속하면 detail2.ejs 보여줌
// /detail4로 접속하면 detail4.ejs 보여줌
// 간략화
app.get('/posts/:id', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/posts/:id로 get요청 -> db(post)에서 해당 id값 가진 데이터 담은 detail.ejs로 예쁘게 꾸민 페이지(/posts/:id) 열어줌");
    db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('detail.ejs', { data: 결과 });
    })
});

app.get('/edit/:id', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/edit/:id로 get요청 -> db(post)에서 해당 id값 가진 데이터 담은 edit.ejs로 예쁘게 꾸민 페이지(/edit/:id) 열어줌");
    db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('edit.ejs', { post: 결과 }); //찾는 게시물 없으면 렌더링 하지 않고 에러 처리하기
    })
})

app.put('/posts', function(요청, 응답){
    //폼에 담긴 제목데이터, 날짜 데이터를 가지고
    //db.collection에다가 업데이트함
    console.log("---------------------------------------");
    console.log("/posts로 put요청 -> 리스트 페이지(/posts) 열어줌 & db(post)의 데이터 수정함")
    console.log(요청.body);
    db.collection('post').updateOne({ _id: parseInt(요청.body.id) },{ $set : { 제목: 요청.body.title, 날짜: 요청.body.date } },function(에러, 결과){
        console.log('edit 폼에 적은 내용 db에 저장 완료');
        응답.redirect('/posts');
    });
});

app.get('/login', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/login으로 get요청 -> login.ejs로 예쁘게 꾸민 페이지(/) 열어줌")
    응답.render('login.ejs');
});

app.get('/fail', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/fail로 get요청 -> login.ejs로 예쁘게 꾸민 페이지(/) 열어줌")
    응답.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(요청, 응답){
    console.log("---------------------------------------");
    console.log("미들웨어로 아이디, 비번 인증함 -> 성공시 페이지(/)를 열어줌 & db(login)에 오브젝트 형식으로 데이터 보내 생성함")
    응답.redirect('/')
});

app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log("---------------------------------------");
    console.log("로그인 인증됐으면 요청.user 값을 담은 mypage.ejs로 예쁘게 꾸민 페이지(/mypage) 열어줌");
    console.log(요청.user);
    응답.render('mypage.ejs', {사용자: 요청.user});
});

function 로그인했니(요청, 응답, next){
    console.log("---------------------------------------");
    console.log("로그인했니 함수 실행 -> 요청.user에 값이 있으면 로그인 인증완료, 없으면 로그인 요청함");
    console.log(요청.user);
    if(요청.user){
        next()
    } else{
        응답.send('로그인을 해주세요')
    }
}

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    console.log("----------------------------------------");
    console.log("/login으로 post요청 -> passport의 localstrategy 미들웨어 -> 아이디, 비번 디비에 있는지 인증해줌")
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)

      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  //id를 이용해서 세션을 저장시킴(로그인 성공 시 발동)
  //세션 데이터를 만들고 세션의 id정보를 쿠키로 보냄
  passport.serializeUser(function(user, done){
    done(null, user.id) //user로 해도 되지만 보통 id를 이용해서 세션을 만듬
  });

  //이 세션 데이터를 가진 사람을 DB에서 찾아주세요(마이페이지 접속 시 발동)
  passport.deserializeUser(function(아이디, done){
    // 디비에서 위에 있는 user.id로 유저를 찾은 뒤에
    // 유저 정보를 done의 두 번째 인자(중괄호) 안에 넣음
    db.collection('login').findOne({id:아이디}, function(에러, 결과){
        done(null, 결과);
    })
  });

app.post('/register', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/register로 post요청 -> 페이지(/) 열어줌 & db(login)에 오브젝트 형식으로 데이터 보내 생성함");
    console.log(요청.body);
    db.collection('login').insertOne({id:요청.body.id, pw:요청.body.pw}, function(에러, 결과){
        응답.redirect('/');
    });
});

app.get('/register', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/register로 get요청 -> register.ejs로 예쁘게 꾸민 페이지(/register) 열어줌");
    응답.render('register.ejs');
});

app.post('/register/id-check', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/register/id-check로 post요청 -> 아이디 중복 검사 위해 db(longin)에서 찾아보고 있으면 성공 메시지 보내고 없으면 실패 메시지 보냄");
    console.log(요청.body);
    db.collection('login').findOne(요청.body, function(에러, 결과){
        console.log(결과);
        if(결과){
            응답.send("실패");
        }
        else{
            응답.send("성공");
        }
    });
});