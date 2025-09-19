//hooks/reply.js
module.exports = {
  reply: async (reply, options, Response, Reply) => {
    if (reply.kind === 'response' && reply.response) {
      await Response.increment('replies', { by: 1, where: { hex: reply.response }, transaction: options.transaction });
    } else if (reply.kind === 'reply' && reply.reply) {
      await Reply.increment('replies', { by: 1, where: { hex: reply.reply }, transaction: options.transaction });
    }
  },
  remove: async (reply, options, Response, Reply) => {
    if (reply.kind === 'response' && reply.response) {
      await Response.decrement('replies', { by: 1, where: { hex: reply.response }, transaction: options.transaction });
    } else if (reply.kind === 'reply' && reply.reply) {
      await Reply.decrement('replies', { by: 1, where: { hex: reply.reply }, transaction: options.transaction });
    }
  },
  before: async (reply, options, Reply) => {
    // if reply is to a response set kind to response else if to a reply set to reply
    if (!reply.response && !reply.reply) throw new Error("Reply must be to either a response or another reply.");
    if (reply.response) {
      reply.kind = 'response';
    } else if (reply.reply) {
      reply.kind = 'reply';
    }
  }
}