const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect("/join?error=exist");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      // 서버에러
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      //로직 실패 //user가 없다는 것은 passport/localStrategy.js에서 비밀번호가 일치하지 않는 경우 or 가입되지 않은 회원일 경우이다.
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      // req.login을 하면 passport/index.js의 passport.serializeUser가 실행됨.
      //로그인 성공의 경우
      if (loginError) {
        // 로그인 과정에서 에러가 날 경우를 대비하여 에러처리 (거의 없음.)
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = (req, res) => {
  // 세션 쿠키를 삭제시킴. 브라우저에 세션 쿠키가 남아있어도 서버에는 지워졌기 때문에 요청을 받아서 수행할 수 없음.
  req.logout(() => {
    res.redirect("/");
  });
};
