const {
  reply: replyHook, response: responseHook,
  review: reviewHook, view: viewHook, like: likeHook
} = require('../hooks');

module.exports = (sequelize, Sequelize, User) => {
  const { INTEGER, STRING, DATE, ENUM, TEXT, ARRAY } = Sequelize;

  const Recipe = sequelize.define("recipes", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    hex: { type: STRING(32), unique: true, allowNull: false },
    chef: { type: STRING(30), allowNull: false, references: { model: User, key: 'username' } },
    name: { type: STRING(500), allowNull: false },
    description: { type: TEXT, allowNull: true },
    video: { type: STRING(1000), allowNull: true },
    images: { type: ARRAY(STRING(1000)), allowNull: true },
    tags: { type: ARRAY(STRING(100)), allowNull: true },
    reviews: { type: INTEGER, defaultValue: 0 },
    views: { type: INTEGER, defaultValue: 0 },
    likes: { type: INTEGER, defaultValue: 0 },
    responses: { type: INTEGER, defaultValue: 0 }
  }, {
    timestamps: true,
    tableName: 'recipes',
    indexes: [
      { unique: true, fields: ['hex'] }, { fields: ['chef'] }, { fields: ['name'] },
      { fields: ['reviews'] }, { fields: ['views'] }, { fields: ['likes'] },
      { fields: ['tags'], using: 'gin' }, { fields: ['responses'] }, { fields: ['createdAt'] }
    ],
    hooks: {
      afterCreate: async (recipe, options) => {
        await User.increment('recipes', { by: 1, where: { username: recipe.chef }, transaction: options.transaction });
      },
      afterDestroy: async (recipe, options) => {
        await User.decrement('recipes', { by: 1, where: { username: recipe.chef }, transaction: options.transaction });
      }
    }
  });

  // Ingredients table
  const Ingredient = sequelize.define("ingredients", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    recipe: { type: STRING(32), allowNull: false, references: { model: Recipe, key: 'hex' } },
    name: { type: STRING(200), allowNull: false },
    quantity: { type: STRING(100), allowNull: true },
    unit: { type: STRING(50), allowNull: true },
    descriptor: { type: STRING(1000), allowNull: true }
  }, {
    timestamps: true,
    tableName: 'ingredients',
    indexes: [
      { fields: ['recipe'] }, { fields: ['name'] }, { fields: ['quantity'] },
      { fields: ['unit'] }, { fields: ['descriptor'] }, { fields: ['createdAt'] }
    ]
  });

  // instructions table
  const Instruction = sequelize.define("instructions", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    recipe: { type: STRING(32), allowNull: false, references: { model: Recipe, key: 'hex' } },
    step: { type: INTEGER, allowNull: false },
    description: { type: TEXT, allowNull: false },
    image: { type: STRING(1000), allowNull: true }
  }, {
    timestamps: true,
    tableName: 'instructions',
    indexes: [
      { fields: ['recipe'] }, { fields: ['step'] }, { fields: ['createdAt'] }
    ]
  });

  // Reviews table
  const Review = sequelize.define("reviews", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    recipe: { type: STRING(32), allowNull: false, references: { model: Recipe, key: 'hex' } },
    user: { type: STRING(30), allowNull: false, references: { model: User, key: 'username' } },
    rating: { type: INTEGER, allowNull: false },
    comment: { type: TEXT, allowNull: true }
  }, {
    timestamps: true,
    tableName: 'reviews',
    indexes: [
      { fields: ['recipe'] }, { fields: ['user'] }, { fields: ['rating'] }, { fields: ['createdAt'] },
      { unique: true, fields: ['recipe', 'user'] }
    ],
    hooks: {
      afterCreate: async (review, options) => {
        await reviewHook.review(review, options, Recipe, User);
      },
      afterDestroy: async (review, options) => {
        await reviewHook.remove(review, options, Recipe, User);
      }
    }
  });

  // Views table
  const View = sequelize.define("views", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    recipe: { type: STRING(32), allowNull: false, references: { model: Recipe, key: 'hex' } },
    user: { type: STRING(30), allowNull: true, references: { model: User, key: 'username' } },
    kind: { type: ENUM('guest', 'user', 'bot'), defaultValue: 'guest' },
    country: { type: STRING(100), allowNull: true },
    region: { type: STRING(100), allowNull: true },
    ip: { type: STRING(45), allowNull: false }
  }, {
    timestamps: true,
    tableName: 'views',
    indexes: [
      { fields: ['recipe'] }, { fields: ['user'] }, { fields: ['ip'] }, { fields: ['createdAt'] }
    ],
    hooks: {
      afterCreate: async (view, options) => {
        await viewHook.view(view, options, Recipe);
      },
      beforeCreate: async (view, options) => {
        await viewHook.before(view, options, View);
      }
    }
  });

  // Responses table:
  const Response = sequelize.define("responses", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    hex: { type: STRING(32), unique: true, allowNull: false },
    recipe: { type: STRING(32), allowNull: false, references: { model: Recipe, key: 'hex' } },
    user: { type: STRING(30), allowNull: false, references: { model: User, key: 'username' } },
    replies: { type: INTEGER, defaultValue: 0 },
    images: { type: ARRAY(STRING(1000)), allowNull: true },
    content: { type: TEXT, allowNull: false }
  }, {
    timestamps: true,
    tableName: 'responses',
    indexes: [
      { unique: true, fields: ['hex'] },
      { fields: ['recipe'] }, { fields: ['user'] }, { fields: ['createdAt'] }
    ],
    hooks: {
      afterCreate: async (response, options) => {
        await responseHook.respond(response, options, Recipe);
      },
      afterDestroy: async (response, options) => {
        await responseHook.remove(response, options, Recipe);
      }
    }
  });

  // Reply table
  const Reply = sequelize.define("replies", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    hex: { type: STRING(32), unique: true, allowNull: false },
    recipe: { type: STRING(32), allowNull: false, references: { model: Recipe, key: 'hex' } },
    response: { type: Sequelize.STRING(32), allowNull: true, references: { model: Response, key: 'hex' } },
    reply: { type: Sequelize.STRING(32), allowNull: true, references: { model: 'replies', key: 'hex' } },
    user: { type: STRING(30), allowNull: false, references: { model: User, key: 'username' } },
    mention: { type: STRING(30), allowNull: true, references: { model: User, key: 'username' } },
    replies: { type: INTEGER, defaultValue: 0 },
    images: { type: ARRAY(STRING(1000)), allowNull: true },
    kind: { type: ENUM('response', 'reply'), allowNull: false },
    content: { type: TEXT, allowNull: false }
  }, {
    timestamps: true,
    tableName: 'replies',
    indexes: [
      { unique: true, fields: ['hex'] },
      { fields: ['response'] }, { fields: ['user'] }, { fields: ['kind'] }, { fields: ['createdAt'] },
    ],
    hooks: {
      afterCreate: async (reply, options) => {
        await replyHook.reply(reply, options, Response, Reply);
      },
      afterDestroy: async (reply, options) => {
        await replyHook.remove(reply, options, Response, Reply);
      }
    }
  });

  // Likes table
  const Like = sequelize.define("likes", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    recipe: { type: STRING(32), allowNull: false, references: { model: Recipe, key: 'hex' } },
    user: { type: STRING(30), allowNull: false, references: { model: User, key: 'username' } }
  }, {
    timestamps: true,
    tableName: 'likes',
    indexes: [
      { unique: true, fields: ['recipe', 'user'] }, { fields: ['recipe'] }, { fields: ['user'] },
      { fields: ['createdAt'] }
    ]
  });

  return { Recipe, Ingredient, Instruction, Review, Response, Reply, View, Like };
}
