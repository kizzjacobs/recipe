const crypto = require('crypto');
const { app: { randomKey } } = require('../configs');

module.exports = {
  // Desc: Generate a 13+3 character long hash
  hash: prefix => {
    const data = `${Date.now()}${randomKey}-${Math.random()}`;
    let hash = crypto.createHash('sha256').update(data).digest('hex');
    return (prefix + hash.slice(0, 13)).toUpperCase();
  },

  // Desc: Generate a 9+3 character long hash
  account: prefix => {
    let data = `${Date.now()}${randomKey}-${Math.random()}`;
    let hash = crypto.createHash('sha256').update(data).digest('hex');
    return (prefix + hash.slice(0, 9)).toUpperCase();
  },

  // Desc: Generate a 14+3 character long hash
  transaction: prefix => {
    let data = `${Date.now()}${randomKey}-${Math.random()}`;
    let hash = crypto.createHash('sha256').update(data).digest('hex');
    return (prefix + hash.slice(0, 14)).toUpperCase();
  },


  // Desc: Generate a 14+3 character long hash
  member: prefix => {
    let data = `${Date.now()}${randomKey}-${Math.random()}`;
    let hash = crypto.createHash('sha256').update(data).digest('hex');
    return (prefix + hash.slice(0, 14)).toUpperCase();
  },

  // Desc: Generate a 20+3 character long hash for file names
  file: prefix => {
    let data = `${Date.now()}${randomKey}-${Math.random()}`;
    let hash = crypto.createHash('sha256').update(data).digest('hex');
    return (prefix + hash.slice(0, 28)).toLowerCase();
  }
}