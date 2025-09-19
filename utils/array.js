//n Map an array of objects to an array of fields
const mapFields = async (arr, field) => {
  return arr.map(item => item[field])
}

// Sum an array of numbers
const sumArray = async (arr) => arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

// A function to slugify a text
const slugify = (input) => {
  return input.replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase();
}

// A function to slugify an array of texts
const slugifyArray = (arr) => {
  return arr.map(item => slugify(item));
};

module.exports = {
  map: mapFields,
  sum: sumArray,
  slugify: slugifyArray
};