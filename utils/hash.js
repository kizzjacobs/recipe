const crypto = require('crypto');
const { app: { randomKey } } = require('../configs');

// Desc: Generate a 13+3 character long hash
const generateHash = prefix => {
	const data = `${Date.now()}${randomKey}-${Math.random()}`;
	let hash = crypto.createHash('sha256').update(data).digest('hex');
	return (prefix + hash.slice(0, 13)).toUpperCase();
}

// Desc: Generate a 9+3 character long hash
const generateAccount = prefix => {
	let data = `${Date.now()}${randomKey}-${Math.random()}`;
	let hash = crypto.createHash('sha256').update(data).digest('hex');
	return (prefix + hash.slice(0, 9)).toUpperCase();
}

// Desc: Generate a 14+3 character long hash
const transaction = prefix => {
	let data = `${Date.now()}${randomKey}-${Math.random()}`;
	let hash = crypto.createHash('sha256').update(data).digest('hex');
	return (prefix + hash.slice(0, 14)).toUpperCase();
}

// Desc: Generate a 20+3 character long hash for file names
const generateFileName = prefix => {
	let data = `${Date.now()}${randomKey}-${Math.random()}`;
	let hash = crypto.createHash('sha256').update(data).digest('hex');
	return (prefix + hash.slice(0, 28)).toLowerCase();
}

module.exports = { generateHash, transaction, generateAccount, generateFileName };