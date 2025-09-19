const bycrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { app: { salt_rounds, jwt_expiry, secret }} = require('../configs');

// A utility function for generating a jwt token
const generateToken = async userClaims => {
  return jwt.sign({ user: userClaims }, secret, {
    expiresIn: jwt_expiry
  });
}

// A utility function for validating a jwt token
const validateToken = async token => {
  return  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return { user: null, error: err}
    }
    return {user: decoded.user, error: null};
  });
}

// Desc: hash password
const hashPassword = async (password) => {
  try {
    return await bycrypt.hash(password, salt_rounds);
  }
  catch (error) {
    return null;
  }
}

// Desc: compare password
const comparePassword = async (password, hash) => {
  try { return await bycrypt.compare(password, hash) }
  catch (error) {
    return false;
  }
}

// Sets cookies in the response object
const setCookies = async (res, user, cookie_age) => {
	let token = await generateToken(user);
	let account = user.account;
	
	let options = {
		maxAge: cookie_age,
		httpOnly: true,
		secure: true,
		sameSite: 'none',
		path: '/'
	};
	
	let userOptions = {
		maxAge: cookie_age,
		httpOnly: false,
		secure: true,
		sameSite: 'none',
	};
	
	res.cookie('x-access-token', token, options);
	res.cookie('x-account-token', account, userOptions);

  return { token, account };
};

// Desc: Generate a random token
const generateRandomToken = length => {
  const token = crypto.randomBytes(length).toString('hex');
  return token.slice(0, length).toUpperCase();
}

module.exports = { 
  password: { hash: hashPassword, compare: comparePassword },
  jwt: { generate: generateToken, validate: validateToken },
  cookies: { set: setCookies },
  code: { generate: generateRandomToken }
};