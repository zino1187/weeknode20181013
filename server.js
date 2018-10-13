var http=require("http"); //기본서버 모듈이므로 기본기능..
var express=require("express");//기본서버 업그레이드

var app=express();//express 객체 생성
var server=http.createServer(app);//서버 생성

/* html, image, css, 동영상 파일등이 정적자원 까지도
일일이 app.get() 으로 처리하게 되면, 서버에 너무 많은
메서드가 코딩되어져야 한다...비현실적...
해결책? 정적자원의 위치를 지정하면된다..바로 이 기능은 
         express 모듈에서 지원한다...

 */

 //express 모듈은 각종 미들웨어라 불리는 기능을 지원하는데
 //미들웨서를 사용시 use() 라는 메서드를 이용할 수 있다..
 //현재 실행중인 js파일의 하드디스크 물리적 경로 반환 
 //__dirname 전역변수
app.use(express.static(__dirname+"/"));

server.listen(8888, function(){
    console.log("웹서버가 8888포트에서 가동중..");
});