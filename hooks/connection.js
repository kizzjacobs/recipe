// hooks/connect.js
module.exports = {
  follow: async (connection, options, User) => {
    await User.increment('following', { by: 1, where: { username: connection.from }, transaction: options.transaction });
    await User.increment('followers', { by: 1, where: { username: connection.to }, transaction: options.transaction });
  },
  unfollow: async (connection, options, User) => {
    await User.decrement('following', { by: 1, where: { username: connection.from }, transaction: options.transaction });
    await User.decrement('followers', { by: 1, where: { username: connection.to }, transaction: options.transaction });
  },
  before: async (connection, options) => {
    if (connection.from === connection.to) {
      throw new Error("A user cannot follow themselves.");
    }
  }
}