var http=require("http"); //기본서버 모듈이므로 기본기능..
var express=require("express");//기본서버 업그레이드
var bodyParser=require("body-parser");//파라미터값들을 json
                                                        //형태 변환하여 받아줌..
var mysql=require("mysql");//외부모듈..   

//지금까지는 내부,외부 모듈만 사용해 왓으나, 개발자가 정의한
//모듈도 사용해보자!!
var constr=require("./dbstring.js");

var app=express();//express 객체 생성
var server=http.createServer(app);//서버 생성

/*매요청마다 db접속을 발생시키지 않기 위해 
커넥션풀을 이용해본다..  */
var pool=mysql.createPool(constr);


/* html, image, css, 동영상 파일등이 정적자원 까지도
일일이 app.get() 으로 처리하게 되면, 서버에 너무 많은
메서드가 코딩되어져야 한다...비현실적...
해결책? 정적자원의 위치를 지정하면된다..바로 이 기능은 
         express 모듈에서 지원한다...
 */

 //express 모듈은 각종 미들웨어라 불리는 기능을 지원하는데
 //미들웨어를 사용시 use() 라는 메서드를 이용할 수 있다..
 //현재 실행중인 js파일의 하드디스크 물리적 경로 반환 
 //__dirname 전역변수
app.use(express.static(__dirname+"/"));
//스프링과 마찬가지로 nodejs 에서도 정해진 뷰템플릿을 지원한다
//jade, ejs 
app.set("view engine", "ejs");//확장자를 명시할 필요없음..
app.set("views", __dirname+"/views");//대신에 ejs 는 무조건
//views 라는 디렉토리에 놓아야 한다...

//extended 의미 파라미터의 json 객체 안에 또 json을 포함할수있는지
app.use(bodyParser.urlencoded({"extended":false}));
app.use(bodyParser.json());

/* 게시판 관련 요청 처리 */
app.post("/board/write", function(request, response){
    //파라미터 값들이 제대로 전송되었는지 확인...
    
    //express 모듈을 사용하면 body 속성을 이용하여 
    //post방식으로 전송된 파라미터값들을 받아올수있다..
    console.log(request.body);
    
    var writer=request.body.writer;
    var title=request.body.title;
    var content=request.body.content;

    //커넥션풀로부터 접속객체 하나를 빌려오자!!
    pool.getConnection(function(error, con){
        if(error){
            console.log(error);                
        }else{
            //제대로 풀로부터 접속 객체 얻어왔다면...
            var sql="insert into notice(writer,title,content)";
            sql+=" values(?,?,?)";

            con.query(sql,[writer,title,content], function(err, result){
                if(err){//쿼리 시도자체가 실패한 경우..
                    console.log(err);                        
                }else{
                     console.log(result);  
                     if(result.affectedRows==0){
                        console.log("등록실패");                            
                     }else{
                        console.log("등록성공"); 
                        
                        //목록을 보여주기!!!   
                        //클라이언트의 브라우저로 하여금
                        //지정한 url 로 다시 접속하라...
                        response.redirect("/board/list");                     
                     }                     
                } 
                //풀에 다시 반납하기!!
                pool.releaseConnection(con,function(e){
                });                                                       
            });
        }        
    });    
    

});

// 게시판 목록요청
app.get("/board/list", function(request, response){
    //select 쿼리로 조회!!!
    
    pool.getConnection(function(error, con){
        if(error){
            console.log(error);
        }else{
            var sql="select notice_id,writer, title ,date_format(regdate,'%Y-%m-%d') as regdate,hit from notice order by notice_id desc";                
            con.query(sql, function(err, result, fields){
                if(err){
                    console.log(err);        
                }else{
                    console.log(result);     
                    //ejs 파일 실행!!!
                    response.render("list",{
                        rows:result 
                    });                   
                }
                pool.releaseConnection(con, function(e){
                });
            });                        
        }        
    });//대여!!

});

//글 상세보기
//단순 링크이므로, get방식으로 요청이 들어옴..
app.get("/board/detail", function(request, response){
    //한건 조회!!!
    pool.getConnection(function(error, con){
        if(error){
            console.log(error);
        }else{
            var sql="select * from notice where notice_id=?";
            con.query(sql, [] , function(err, result, fields){

            });
        }
    });//대여



});

server.listen(8888, function(){
    console.log("웹서버가 8888포트에서 가동중..");
});









