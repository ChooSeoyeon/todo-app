var router = require('express').Router();

module.exports = function(passport){
    router.post('/register', function(요청, 응답){
        console.log("---------------------------------------");
        console.log("/register로 post요청 -> 페이지(/) 열어줌 & db(login)에 오브젝트 형식으로 데이터 보내 생성함");
        console.log(요청.body);
        요청.app.db.collection('login').insertOne({id:요청.body.id, pw:요청.body.pw}, function(에러, 결과){
            응답.redirect('/');
        });
    });
    
    router.get('/register', function(요청, 응답){
        console.log("---------------------------------------");
        console.log("/register로 get요청 -> register.ejs로 예쁘게 꾸민 페이지(/register) 열어줌");
        응답.render('register.ejs');
    });
    
    router.post('/register/id-check', function(요청, 응답){
        console.log("---------------------------------------");
        console.log("/register/id-check로 post요청 -> 아이디 중복 검사 위해 db(longin)에서 찾아보고 있으면 성공 메시지 보내고 없으면 실패 메시지 보냄");
        console.log(요청.body);
        요청.app.db.collection('login').findOne(요청.body, function(에러, 결과){
            console.log(결과);
            if(결과){
                응답.send("실패");
            }
            else{
                응답.send("성공");
            }
        });
    });
    
    router.get('/login', function(요청, 응답){
        console.log("---------------------------------------");
        console.log("/login으로 get요청 -> login.ejs로 예쁘게 꾸민 페이지(/) 열어줌")
        응답.render('login.ejs');
    });
    
    router.get('/fail', function(요청, 응답){
        console.log("---------------------------------------");
        console.log("/fail로 get요청 -> login.ejs로 예쁘게 꾸민 페이지(/) 열어줌")
        응답.render('login.ejs');
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
    
    router.get('/mypage', 로그인했니, function(요청, 응답){
        console.log("---------------------------------------");
        console.log("로그인 인증됐으면 요청.user 값을 담은 mypage.ejs로 예쁘게 꾸민 페이지(/mypage) 열어줌");
        console.log(요청.user);
        응답.render('mypage.ejs', {사용자: 요청.user});
    });
    
    router.post('/login', passport.authenticate('local', {
        failureRedirect : '/auth/fail'
    }), function(요청, 응답){
        console.log("---------------------------------------");
        console.log("미들웨어로 아이디, 비번 인증함 -> 성공시 페이지(/)를 열어줌 & db(login)에 오브젝트 형식으로 데이터 보내 생성함")
        응답.redirect('/')
    });

    return router;
}
