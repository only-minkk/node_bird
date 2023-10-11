const app = require("../app");
const request = require("supertest");
const { sequelize } = require("../models");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// beforeEach(() => {});

// 회원가입

describe("POST /join", () => {
  test("회원가입", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "twosome@naver.com",
        nick: "twosome",
        password: "twosome",
      })
      .expect("Location", "/")
      .expect(302, done);
  });

  test("회원가입 이미 했는데 또 하는 경우", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "twosome@naver.com",
        nick: "twosome",
        password: "twosome",
      })
      .expect("Location", "/join?error=exist")
      .expect(302, done);
  });
});

// 로그인 상태에서 회원가입

describe("POST /join", () => {
  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "twosome@naver.com",
        password: "twosome",
      })
      .end(done);
  });

  test("로그인 했는데 회원가입 하는 경우 ", (done) => {
    const message = encodeURIComponent("로그인한 상태입니다.");
    agent
      .post("/auth/join")
      .send({
        email: "twosome@naver.com",
        nick: "twosome",
        password: "twosome",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });
});

// 로그인
describe("POST /login", () => {
  test("로그인 수행", (done) => {
    request(app)
      .post("/auth/login")
      .send({
        email: "twosome@naver.com",
        password: "twosome",
      })
      .expect("Location", "/")
      .expect(302, done);
  });

  test("가입되지 않은 회원의 경우", (done) => {
    const message = encodeURIComponent("가입되지 않은 회원입니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "twosome1@naver.com",
        password: "twosome",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });

  test("비밀번호 틀림", (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "twosome@naver.com",
        password: "twosome1",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });
});

// 로그아웃

describe("GET /logout", () => {
  test("로그인되어 있지 않으면 403", (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });
  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "twosome@naver.com",
        password: "twosome",
      })
      .end(done);
  });
  test("로그아웃 수행", (done) => {
    agent.get("/auth/logout").expect("Location", "/").expect(302, done);
  });
});

// afterEach(() => {});

// afterAll(() => {});
