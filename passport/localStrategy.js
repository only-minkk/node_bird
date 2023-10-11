const passport = require("passport");
const { Strategy: localStrategy } = require("passport-local");
// const { localStrategy } = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/user");

module.exports = () => {
  // 로그인을 해도 되는지 안되는지 판단하는 로직
  passport.use(
    new localStrategy(
      {
        usernameField: "email", // req.body.email
        passwordField: "password", // req.body.password
        passReqToCallback: false, // true일경우 다음 함수가 async(req, email, password, done) 이 되고 false일 경우 async(email, password, done)이 된다.
        // 즉 로직에서 req가 필요하다면 true로하고 필요없다면 false로 한다.
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          //해당 이메일이 존재하는지 확인
          if (exUser) {
            // 있다면 비밀번호 확인
            const result = await bcrypt.compare(password, exUser.password); // password는 입력한 비밀번호 ,exUser.password는 db에 있는 비밀번호, compare메서드로 두 개를 비교
            if (result) {
              // 일치한다면
              done(null, exUser); // done (서버실패, 성공유저, 로직실패)
              //로그인 성공 // 성공하는 순간 controllers/auth.js의 login라우터의 `(authError,user, info)`로 간다.
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." }); // 서버에 에러는 없지만 로그인을 시켜주면 안되는 경우
            }
          } else {
            // 해당 이메일이 존재하지 않다면
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
