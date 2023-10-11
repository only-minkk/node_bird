const passport = require("passport");
const { Strategy: kakaoStrategy } = require("passport-kakao");
const User = require("../models/user");

module.exports = () => {
  passport.use(
    new kakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        // accessToken, refreshToken은 카카오 API를 호출하는데 필요함.
        // 해당 프로젝트에선 필요 없음.
        // profile에 유저의 정보가 담겨옴. 하지만 때때로 바뀌어서 console.log로 확인해야함.
        console.log("profile", profile);
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          if (exUser) {
            //로그인
            done(null, exUser);
          } else {
            // 회원가입
            const newUser = await User.create({
              email: profile._json?.kakao_account?.email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
