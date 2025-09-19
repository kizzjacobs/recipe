// hooks/like.js
module.exports = {
  like: async (like, options, Recipe, Response, Reply) => {
    await Recipe.increment('likes', { by: 1, where: { hex: like.recipe }, transaction: options.transaction });
  },
  unlike: async (like, options, Recipe) => {
    await Recipe.decrement('likes', { by: 1, where: { hex: like.recipe }, transaction: options.transaction });
  },
  before: async (like, options, Like) => {
    // if similar like exists, throw error
    const existingLike = await Like.findOne({ where: { user: like.user, recipe: like.recipe }, transaction: options.transaction });
    if (existingLike) {
      throw new Error("User has already liked this recipe.");
    }
  }
}