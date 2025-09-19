// Desc: Utility functions for feed: convert a page and limit to a number
const convertToNumber = (str, kind) => {
	const num = parseInt(str, 10);
	if (isNaN(num)) {
		return kind === 'page' ? 1 : 10;
	}

	if (num <= 0) return 1;
	
	if (kind === 'limit' && num > 100) return 100;
	return num;
}

module.exports = { convertToNumber };