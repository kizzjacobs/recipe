const { 
  models: { recipe: { Recipe } }
} =  require('../../models');

module.exports = async hex => {
  const recipe = await Recipe.findOne({ where: { hex } });
  if(!recipe) return null;
  await recipe.destroy();
  return true;
};