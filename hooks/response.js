// hooks/response.js
module.exports = {
  respond: async (response, options, Recipe) => {
    await Recipe.increment('responses', { by: 1, where: { hex: response.recipe }, transaction: options.transaction });
  },
  remove: async (response, options, Recipe) => {
    await Recipe.decrement('responses', { by: 1, where: { hex: response.recipe }, transaction: options.transaction });
  }
}