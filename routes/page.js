const express = require("express");
const router = express.Router();
const {
  renderJoin,
  renderMain,
  renderProfile,
  renderHashtag,
} = require("../controllers/page");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares");

router.use((req, res, next) => {
  // res.locals는 아래 라우터들에서 공통적으로 쓰기일 원하는 공통 변수, 공통 값들과 같은 데이터 선언.할당
  res.locals.user = req.user;
  // res.locals.followerCount = 0;
  // res.locals.followingCount = 0;
  // res.locals.followingIdList = [];
  res.locals.followerCount = req.user?.Followers?.length || 0;
  res.locals.followingCount = req.user?.Followings?.length || 0;
  res.locals.followingIdList = req.user?.Followings?.map((f) => f.id) || [];
  next();
});

router.get("/profile", isLoggedIn, renderProfile);
router.get("/join", isNotLoggedIn, renderJoin);
router.get("/", renderMain);
router.get("/hashtag", renderHashtag); // hastag?hashtag=고양이

module.exports = router;
