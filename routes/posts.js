var router = require('express').Router();

//특정 라우터 파일에 미들웨어를 적용하고 싶으면
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

router.use(로그인했니);

router.get('/write', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/write로 get요청 -> write.ejs로 예쁘게 꾸민 페이지(/write) 열어줌")
    응답.render('write.ejs');
});

// /posts로 GET요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
router.get('/', function(요청, 응답){
    //디비에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요.
    //html 보여주는 것보다 데이터 꺼내는게 먼지임! (순서 주의)
    console.log("---------------------------------------");
    요청.app.db.collection('post').find({아이디:요청.user.id}).toArray(function(에러, 결과){
        console.log("/posts로 get요청 -> db(post)에 있는 데이터 담은 list.ejs로 예쁘게 꾸민 페이지(/posts) 열어줌")
        console.log("db(post)에서 가져온 거 결과 출력하면 아래와 같음")
        console.log(결과);
        console.log(요청.user);
        응답.render('piglist.ejs', { posts : 결과, 사용자: 요청.user});
    });
});

// 어떤 사람이 /posts 경로로 POST 요청을 하면
// 데이터 2개(날짜, 제목)를 보내주는데,
// 이 때, 'post'라는 이름을 가진 collection에 두 개 데이터를 저장하기
router.post('/', 로그인했니, function(요청,응답){
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

    요청.app.db.collection('counter').findOne({name: '게시물개수'}, function(에러, 결과){
        console.log(결과.totalPost);
        var 총게시물개수 = 결과.totalPost; //없어도 되낭?
        var 저장할거 = {
            _id: 총게시물개수+1, 
            제목: 요청.body.title, 
            날짜: 요청.body.date, 
            작성자:요청.user._id, 
            아이디:요청.user.id 
        };

        요청.app.db.collection('post').insertOne( 저장할거, function(){
            console.log('write 폼에 적은 내용 db에 저장 완료');
            //  +counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야함.
            요청.app.db.collection('counter').updateOne({name: '게시물개수'}, { $inc : {totalPost:1} }, function(에러, 결과){
               console.log('db의 총게시물개수 1증가 완료')
               if (에러) { return console.log(에러) }
             });
        });
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
router.delete('/:id', 로그인했니, function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/posts/:id로 delete요청 -> 응답으로 페이지 안열어주고 status 메시지 보냄 & url 속 숫자로 요청한 데이터를 db(post)에서 삭제함")
    console.log(요청.params.id);
    console.log(요청.user._id);  //id로 해도 되나??
    var 삭제할데이터 = {_id: parseInt(요청.params.id), 작성자: 요청.user._id}
    요청.app.db.collection('post').deleteOne( 삭제할데이터, function(에러, 결과){
        console.log('삭제완료'); //실패했을떄도 뜸 ㅠㅠ 고쳐야할듯
        //if(결과) {console.log(결과)};//몇 개 삭제됐는지 뜸
        응답.status(200).send({message: '삭제 성공했습니다'});
    });
});

// /detail2로 접속하면 detail2.ejs 보여줌
// /detail4로 접속하면 detail4.ejs 보여줌
// 간략화
router.get('/:id', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/posts/:id로 get요청 -> db(post)에서 해당 id값 가진 데이터 담은 detail.ejs로 예쁘게 꾸민 페이지(/posts/:id) 열어줌");
    요청.app.db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('detail.ejs', { data: 결과 });
    })
});

router.get('/edit/:id', function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/edit/:id로 get요청 -> db(post)에서 해당 id값 가진 데이터 담은 edit.ejs로 예쁘게 꾸민 페이지(/edit/:id) 열어줌");
    요청.app.db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('edit.ejs', { post: 결과 }); //찾는 게시물 없으면 렌더링 하지 않고 에러 처리하기
    })
})

router.put('/', function(요청, 응답){
    //폼에 담긴 제목데이터, 날짜 데이터를 가지고
    //db.collection에다가 업데이트함
    console.log("---------------------------------------");
    console.log("/posts로 put요청 -> 리스트 페이지(/posts) 열어줌 & db(post)의 데이터 수정함")
    console.log(요청.body);
    요청.app.db.collection('post').updateOne({ _id: parseInt(요청.body.id) },{ $set : { 제목: 요청.body.title, 날짜: 요청.body.date } },function(에러, 결과){
        console.log('edit 폼에 적은 내용 db에 저장 완료');
        응답.redirect('/posts');
    });
});

module.exports = router;
