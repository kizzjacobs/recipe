// hooks/view.js
module.exports = {
  view: async (view, options, Recipe) => {
    await Recipe.increment('views', { by: 1, where: { hex: view.recipe }, transaction: options.transaction });
  },
  before: async (view, options, View) => {
    // if user is provided change kind to user else keep as guest
    if (view.user) {
      view.kind = 'user';
    } else {
      view.kind = 'guest';
    }
  }
}