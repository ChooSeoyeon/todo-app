var router = require('express').Router();
//npm으로 설치했던 express라이브러리 쓰겠습니다.
//express라이브러리의 Router()라는 함수 쓰겠습니다.
//require('파일경로') 혹은 require('라이브러리명')
// 다른 파일이나 라이브러리 여기에 첨부하겠습니다.
// require('/shop.js'); -> shop.js에서 배출한 변수나 그런것들

//분리해서 관리하고 싶은 라우트들 app대신 router로 바꿔서 쓰기

router.get('/',function(요청, 응답){
    console.log("---------------------------------------");
    console.log("/로 get요청 -> index.ejs로 예쁘게 꾸민 페이지(/) 열어줌")
    응답.render('index.ejs');
});

module.exports = router;
//module.exports : 자바스크립트를 다른 파일에서 가져다 쓰고 싶을 떄 쓰는 문법
//얘룰 둘묜 다른 곳에서 shop.js를 가져다 쓸 때 
// module.exports=내보낼 변수명