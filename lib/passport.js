module.exports = function(app){
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    app.use(passport.initialize());
    app.use(passport.session()); 
    
      passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: true,
        passReqToCallback: false,
      }, function (입력한아이디, 입력한비번, done) {
        console.log("----------------------------------------");
        console.log("/login으로 post요청 -> passport의 localstrategy 미들웨어 -> 아이디, 비번 디비에 있는지 인증해줌")
        console.log(입력한아이디, 입력한비번);
        app.db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
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
        app.db.collection('login').findOne({id:아이디}, function(에러, 결과){
            done(null, 결과);
        })
      });

      return passport;
}