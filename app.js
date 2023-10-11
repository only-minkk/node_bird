const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
const { sequelize } = require("./models");

dotenv.config(); // process.env
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const passportConfig = require("./passport");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", { express: app, watch: true });
sequelize
  .sync({ force: false }) // 개발시에 force:true로 하면 기존 테이블들 삭제되었다가 새로 만들어짐. 배포시에 하면 큰일 남. 데이터 다 날라감.
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev")); // 로깅하는 걸 개발모드. 배포할땐 'dev' -> "combined" 서비스 운영에 필요한 적은 내용만 로깅. 로그 남는게 서버에 용량을 많이 차지한다. 그래서 개발할 때만 더 자세하게 사용.
app.use(express.static(path.join(__dirname, "public"))); // public폴더를 static폴더로 만듦. 프로그램에서 자유롭게 접근할 수 있게. 보안상 브라우저에서는 파일에 접근할 수 없게하는데 public폴더만 허용.
app.use("/img", express.static(path.join(__dirname, "uploads")));
//__dirname => app.js가 있는 폴더의 public 폴더.
app.use(express.json()); // req.body를 ajax json 요청으로부터
app.use(express.urlencoded({ extended: false })); //form요청 받을 수 있게. // req.body 폼으로부터
app.use(cookieParser(process.env.COOKIE_SECRET)); //cookie 전송 처리
// {connect.sid: 1231241413} 객체로 만들어진 쿠키가 다시 passport로 들어가게돼서 `passport.deserializeUser`가 실행됨

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true, //자바스크립트에서 접근 못하게.
      secure: false, //https적용할 때 true로 변경
    },
  })
);
app.use(passport.initialize()); // req.user, req.login, req.idAuthenticate, rea.logout // passport를 연결하면 해당 메서드들이 생성
app.use(passport.session()); // connect.sid라는 이름으로 세션 쿠키가 브라우저에 전송 // 브라우저로 `connect.sid=1231241413` // 다음 요청부터는 쿠키가 함께 서버로 보내짐. 그럴때 윗 줄에 있는 cookieParsr가 쿠키를 분석해서 객체로 만들어줌.

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  // 404 NOT FOUND
  const error = new Error(`${req.method}, ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  //배포모드일때는 에러를 안넣어주고, 개발 모드인 경우 에러 넣어줌, 에러메시지를 그대로 노출하는 것도 보안에 위험할 수 있다.
  // 에러 로그 보여주는 서비스가 따로 있다. 그런 서비스한테 넘긴다. 사용자 화면에 에러를 표시하는 것은 안좋다.
  res.status(err.status || 500);
  res.render("error"); // views/error.html파일이 응답으로 전송
  // 14, 15라인에 설정을 해놨기 때문에 nunjucks가 views 폴더에서 error.html을 찾아서 응답으로 보내준다.
});

module.exports = app;
