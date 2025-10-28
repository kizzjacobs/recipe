// hooks/review.js
module.exports = {
  review: async (review, options, Recipe, User) => {
    await Recipe.increment('reviews', { by: 1, where: { hex: review.recipe }, transaction: options.transaction });
    await User.increment('reviews', { by: 1, where: { username: review.user }, transaction: options.transaction });
  },
  remove: async (review, options, Recipe, User) => {
    await Recipe.decrement('reviews', { by: 1, where: { hex: review.recipe }, transaction: options.transaction });
    await User.decrement('reviews', { by: 1, where: { username: review.user }, transaction: options.transaction });
  }
};