const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    // user === exUser
    done(null, user.id); // user id만 추출
  });
  // 세션 { 51621981161: 1}  === { 세션쿠키 (랜덤) : 유저아이디} -> 메모리에 저장됨  // 유저정보를 통채로 저장하면 메모리가 커짐. 그래서 id만 추출해서 저장

  passport.deserializeUser((id, done) => {
    // 쿠키에서 id를 찾아서 id로 user정보를 복원시킴
    User.findOne({
      where: { id },
      include: [
        {
          // 팔로잉
          model: User,
          attributes: ["id", "nick"],
          as: "Followers",
        },
        {
          // 팔로워
          model: User,
          attributes: ["id", "nick"],
          as: "Followings",
        },
      ],
    })
      .then((user) => done(null, user)) // 복원된 유저가 req.user가 됨. 그렇게 돼서 routes/page.js에서 req.user가 쓰일 수 있게 됨. 이 모든 과정은 요청이 라우터에 전달되기 전에 이루어져서 유저정보가 req.user라는 상수로 라우터에 전달된다.
      .catch((err) => done(err));
  });

  local();
  kakao();
};
