const Post = require("../models/post");
const Hashtag = require("../models/hashtag");

exports.afterUploadImage = (req, res) => {
  console.log(req.file); // multer.single은 req.file로 넘어온다.
  res.json({ url: `/img/${req.file.filename}` });
};

exports.uploadPost = async (req, res, next) => {
  // req.body.content, req.body.url이 넘어온다.
  try {
    // ex) 노드교과서 너무 재밌어요. #노드교과서 #익스프레스 짱짱
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    // hashtags = [ '#노드교과서', '#익스프레스' ]
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      // result = [[노드교과서, bool], [익스프레스, bool]]
      await post.addHashtags(result.map((r) => r[0]));
      // result.map(r => r[0]) = [노드교과서, 익스프레스]
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};
