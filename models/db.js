const { Sequelize } = require('sequelize');
const {
  data: { name, password, pool, user, port, dialect, host }
} = require('../configs');

const sequelize = new Sequelize(
  name, user, password,
  {
    host: host,
    dialect: dialect,
    port: port,
    operatorsAliases: 0,
    pool: {
      max: pool.max,
      min: pool.min,
      acquire: pool.acquire,
      idle: pool.idle,
    },

    // disable logging : false
    logging: console.log
  }
);

module.exports = { sequelize, Sequelize };