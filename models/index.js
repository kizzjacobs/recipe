const { sequelize, Sequelize } = require('./db');

// Import all models
const { User, Connection } = require('./users')(sequelize, Sequelize);
const {
  Recipe, Ingredient, Instruction,
  Review, Response, Reply, View, Like
} = require('./recipes')(sequelize, Sequelize, User);


// Function to sync all models
const sync = async () => {
  // Check each table's existence
  const tables = [
    'users', 'connections', 'recipes', 'ingredients', 'instructions',
    'reviews', 'responses', 'replies', 'views', 'likes'
  ];

  for (const table of tables) {
    const tableExists = await sequelize.query(
      /* SQL */ `SELECT to_regclass('${table}');`
    ).then(result => result[0][0].to_regclass !== null).catch(() => false);

    if (!tableExists) {
      console.log(`Table "${table}" does not exist. Syncing all models...`);
      await sequelize.sync({ alter: true });
      console.log('All models were synchronized successfully.');
      return;
    }
  }

  console.log('All tables exist. No need to sync.');
}


module.exports = {
  db: { sequelize, Sequelize },
  models: {
    user: { User, Connection },
    recipe: { Recipe, Ingredient, Instruction, Review, Response, Reply, View, Like }
  },
  sync
};