const express = require("express");
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
// 브라우저에서 프론트엔드가 로그인 안할때 게시글 못올리게 막을텐데 굳이 로그인검사를 해야하나? 브라우저는 클라이언트 중 하나이다. postman같은 걸로 요청을 보낼 수도 있다. 그렇기 때문에 서버에서 막아야한다.
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { afterUploadImage, uploadPost } = require("../controllers/post");

try {
  fs.readdirSync("uploads");
} catch (error) {
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      // console.log(file); // 보통 console.log로 파일 속성이 어떤지, 어떤 구조인지 확인 해봐야 한다. 확인을 해봐야 `file.originalname`같이 호출할 수 있다.
      const ext = path.extname(file.originalname); // 이미지.png -> 이미지20220913.png // 이미지의 이름이 같은 경우 덮어씌워지기 때문에 이미지 이름 뒤에 시간 스트링을 붙여서 중복을 방지한다.
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, //20MB
});

// POST /post/img
router.post("/img", isLoggedIn, upload.single("img"), afterUploadImage);
// "img"란 명칭은 views/main.html에서 `formData.append('img', this.files[0])` 여기에 해당하는 "img"라는 글자와 같아야한다.

// POST /post
const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), uploadPost); // 게시글을 올릴 땐 이미지를 안올리기 때문에 `upload2.none()`을 사용.
// multer를 새로 만든 이유는 이미지를 업로드하는 multer와 게시글을 업로드 하는 multer2를 따로 사용할 것이기 때문.

module.exports = router;
