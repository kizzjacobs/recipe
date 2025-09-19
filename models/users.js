const {
  connection: { follow, unfollow, before }
} = require('../hooks');

module.exports = (sequelize, Sequelize) => {
  const { INTEGER, STRING, DATE, ENUM, TEXT } = Sequelize;

  const User = sequelize.define("users", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: STRING(30), unique: true, allowNull: false },
    email: { type: STRING(100), unique: true, allowNull: false },
    phone: { type: STRING(15), unique: true, allowNull: false },
    password: { type: STRING(100), allowNull: false },
    name: { type: STRING(100), allowNull: false },
    gender: { type: ENUM('male', 'female', 'other'), allowNull: false },
    role: { type: ENUM('admin', 'user', 'dev', 'chef'), defaultValue: 'user' },
    picture: { type: STRING(1000), allowNull: true },
    bio: { type: TEXT, allowNull: true },
    dob: { type: DATE, allowNull: false },
    followers: { type: INTEGER, defaultValue: 0 },
    following: { type: INTEGER, defaultValue: 0 },
    reviews: { type: INTEGER, defaultValue: 0 },
    recipes: { type: INTEGER, defaultValue: 0 }
  }, {
    timestamps: true,
    tableName: 'users',
    indexes: [
      { unique: true, fields: ['username'] }, { unique: true, fields: ['email'] },
      { unique: true, fields: ['phone'] }, { unique: false, fields: ['followers'] }, { unique: false, fields: ['following'] },
      { fields: ['role'] }, { fields: ['name'] }, { fields: ['createdAt'] }
    ]
  });


  // Connections tables
  const Connection = sequelize.define("connections", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    from: { type: STRING(30), allowNull: false, references: { model: User, key: 'username' } },
    to: { type: STRING(30), allowNull: false, references: { model: User, key: 'username' } }
  }, {
    timestamps: true,
    tableName: 'connections',
    indexes: [
      { unique: true, fields: ['from', 'to'] }, { fields: ['from'] }, { fields: ['to'] },
      { fields: ['createdAt'] }
    ],
    hooks: {
      afterCreate: async (connection, options) => {
        if (connection.from !== connection.to) {
          await follow(connection, options, User);
        }
      },
      afterDestroy: async (connection, options) => {
        if (connection.from !== connection.to) {
          await unfollow(connection, options, User);
        }
      },
      beforeCreate: async (connection, options) => {
        await before(connection, options);
      }
    }
  });


  // Associations: User --> Connection (followers/following)
  User.hasMany(Connection, { foreignKey: 'from', sourceKey: 'username', as: 'following_connections', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Connection.belongsTo(User, { foreignKey: 'from', targetKey: 'username', as: 'follower_user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  User.hasMany(Connection, { foreignKey: 'to', sourceKey: 'username', as: 'follower_connections', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Connection.belongsTo(User, { foreignKey: 'to', targetKey: 'username', as: 'following_user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  return { User, Connection };
}
