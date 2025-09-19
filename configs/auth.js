module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY
  },
  password: {
    salt: parseInt(process.env.SALT_ROUNDS, 10) || 10
  },
  cookies: {
    age: parseInt(process.env.COOKIE_AGE, 10) || 30 * 24 * 60 * 60 * 1000
  },
  hex: {
    secret: process.env.HEX_SECRET,
    random: process.env.HEX_RANDOM
  }
};
