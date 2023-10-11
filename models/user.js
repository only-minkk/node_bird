const Sequelize = require("sequelize");

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100), // 암호화되면 길어짐
          allowNull: true,
        },
        provider: {
          type: Sequelize.ENUM("local", "kakao"), // ENUM은 둘 중 하나만 적게끔 제한을 걸어둠.
          allowNull: false,
          defaultValue: "local", // 기본값은 local
        },
        snsId: {
          type: Sequelize.STRING(30), //카카오 로그인 전용
          allowNull: true,
        }, // 이메일로 가입한 사람은 snsId가 없고 provider=local일 것이다. 반대로 sns로 가입한 사람은 email이 없고 snsId가 있고 provider=kakao 일 것이다.
      },
      {
        sequelize,
        timestamps: true, //createdAt, updatedAt
        underscored: false, // true-> created_at, updated_at
        modelName: "User", // js에서 쓰는 이름
        tableName: "users", // db에서의 테이블 이름
        paranoid: true, // deletedAt 유저 삭제일 // soft delete
        charset: "utf8", // db에 어떤식으로 문자를 저장할지, 이모티콘 필요하면 utf8mb4
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.belongsToMany(db.User, {
      // 팔로워
      foreignKey: "followingId",
      as: "Followers",
      through: "Follow",
    });
    db.User.belongsToMany(db.User, {
      // 팔로잉
      foreignKey: "followerId",
      as: "Followings",
      through: "Follow",
    });
    // db에 있는 것 말고 Follow 같은 것들은
    // db.sequelize.models.Follow 로 접근 가능
  }
}

module.exports = User;
