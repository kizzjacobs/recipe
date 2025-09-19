module.exports = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  env: process.env.ENV || 'development',
  name: process.env.NAME || 'recipe',
  version: process.env.VERSION || '0.1.0'
};