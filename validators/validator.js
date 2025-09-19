const {
  hash: { generateHash, generateAccount, transaction },
  auth: { password: { hash }, code: { generate } }
} = require('../utils');

// String Utilities 
const slugify = input =>
  input
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/gi, '')  // Remove non-alphanumeric characters
    .replace(/-{2,}/g, '-')       // Replace multiple hyphens with single
    .toLowerCase();               // Convert to lowercase

const slugifyArray = arr => arr.map(slugify);

// Validation Helpers
const EMAIL_REGEX = /\S+@\S+\.\S+/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const escapeHtml = str => str.replace(/[&<>"']/g, char => HTML_ESCAPES[char]);
const sanitize = value => escapeHtml(value.trim());

const validationHelpers = {
  email: value => EMAIL_REGEX.test(value),
  phone: value => value.length >= 10,
  password: value => PASSWORD_REGEX.test(value),
  dob: value => new Date(value).getFullYear() <= new Date().getFullYear() - 18,
  date: value => new Date(value) instanceof Date,
  topics: value => Array.isArray(value) && value.length <= 5 && value.every(topic => typeof topic === 'string' && topic.length <= 50)
};

// Validator Functions
const typeValidators = {
  boolean: (values, key) => {
    if (typeof values[key] !== 'boolean') throw new Error(`${key} must be a boolean`);
  },

  string: (values, key) => {
    if (typeof values[key] !== 'string') throw new Error(`${key} must be a string`);
    values[key] = sanitize(values[key]);
  },

  content: (values, key) => {
    const content = values[key];
    if (typeof content !== 'object' || !content.encrypted || !content.nonce ||
      typeof content.encrypted !== 'string' || typeof content.nonce !== 'string') {
      throw new Error(`${key} requires encrypted and nonce string properties`);
    }
  },

  number: (values, key) => {
    if (typeof values[key] !== 'number') throw new Error(`${key} must be a number`);
  },

  hash: async (values, key) => {
    if (typeof values[key] !== 'string' || values[key].length !== 3) {
      throw new Error(`${key} must be a 3-character string`);
    }
    values[key] = await generateHash(values[key]);
  },

  hex: async (values, key) => {
    if (typeof values[key] !== 'string' || values[key].length !== 3) {
      throw new Error(`${key} must be a 3-character string`);
    }
    values[key] = await generateHash(values[key]);
  },

  transaction: async (values, key) => {
    if (typeof values[key] !== 'string' || values[key].length !== 3) {
      throw new Error(`${key} must be a 3-character string`);
    }
    values[key] = await transaction(values[key]);
  },

  account: async (values, key) => {
    if (typeof values[key] !== 'string' || values[key].length !== 3) {
      throw new Error(`${key} must be a 3-character string`);
    }
    values[key] = await generateAccount(values[key]);
  },

  // Make the password validator async and await the hash function
  password: async (values, key) => {
    if (!validationHelpers.password(values[key])) {
      throw new Error('Password requires uppercase, lowercase, number, and special character');
    }
    // Await the hash function result
    values[key] = await hash(values[key]);
  },

  // Make the pin validator async and await the hash function
  pin: async (values, key) => {
    const pin = values[key].toString();
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be a 4-digit number');
    }
    // Await the hash function result
    values[key] = await hash(values[key]);
  },

  code: (values, key) => {
    if (typeof values[key] !== 'number') {
      throw new Error(`${key} must be a number`);
    }
    values[key] = generate(values[key]);
  },

  email: (values, key) => {
    if (!validationHelpers.email(values[key])) throw new Error('Invalid email');
  },

  date: (values, key) => {
    if (!validationHelpers.date(values[key])) throw new Error('Invalid date');
  },

  dob: (values, key) => {
    if (!validationHelpers.dob(values[key])) throw new Error('Must be at least 18 years old');

    if (isNaN(new Date(values[key]))) {
      throw new Error('Invalid date format');
    }
    values[key] = new Date(values[key]);
  },

  date: (values, key) => {
    if (!typeof values[key] === 'string' || isNaN(new Date(values[key]))) {
      throw new Error(`${key} must be a valid date string`);
    }
    values[key] = new Date(values[key]);
  },

  phone: (values, key) => {
    if (!validationHelpers.phone(values[key])) throw new Error('Invalid phone number');
  },

  topics: (values, key) => {
    if (!validationHelpers.topics(values[key])) {
      throw new Error('Topics must be ≤5 strings (≤50 chars each)');
    }
    values[key] = slugifyArray(values[key]);
  },

  slug: (values, key) => {
    if (typeof values[key] !== 'string' || values[key].length < 3) {
      throw new Error(`${key} must be a string with ≥3 characters`);
    }
    values[key] = slugify(values[key]);
  },

  images: (values, key) => {
    if (!Array.isArray(values[key]) || !values[key].every(img => typeof img === 'string')) {
      throw new Error(`${key} must be an array of strings`);
    }
  },

  kins: (values, key) => {
    // Kins should be an array of objects with specific properties: name, phone, address, relationship
    if (!Array.isArray(values[key])) {
      throw new Error(`${key} must be an array`);
    }
    values[key].forEach((kin, index) => {
      if (typeof kin !== 'object' || !kin.name || !kin.phone || !kin.address || !kin.relationship) {
        throw new Error(`${key}[${index}] must be an object with properties: name, phone, address, relationship`);
      }
      // Further validation can be added for each property
      if (typeof kin.name !== 'string' || typeof kin.phone !== 'string' ||
        typeof kin.address !== 'string' || typeof kin.relationship !== 'string') {
        throw new Error(`${key}[${index}] properties must be strings`);
      }
    });

    values[key] = values[key].map(kin => ({
      name: sanitize(kin.name),
      phone: sanitize(kin.phone),
      address: sanitize(kin.address),
      relationship: sanitize(kin.relationship)
    }));
  }
};

// Constraint Checks
const checkConstraints = (value, key, rule) => {
  const constraints = [
    { check: 'min', test: (v, c) => v < c, message: c => `≥ ${c}` },
    { check: 'max', test: (v, c) => v > c, message: c => `≤ ${c}` },
    { check: 'minLength', test: (v, c) => v.length < c, message: c => `length ≥ ${c}` },
    { check: 'maxLength', test: (v, c) => v.length > c, message: c => `length ≤ ${c}` },
    { check: 'minValue', test: (v, c) => v < c, message: c => `≥ ${c}` },
    { check: 'maxValue', test: (v, c) => v > c, message: c => `≤ ${c}` },
  ];

  constraints.forEach(({ check, test, message }) => {
    const constraintValue = rule[check];
    if (constraintValue !== undefined && test(value, constraintValue)) {
      throw new Error(`${key} must be ${message(constraintValue)}`);
    }
  });
};

// Main Validation
const validate = async (values, schema) => {
  // Use for...of loop to handle async validators correctly
  for (const [key, rule] of Object.entries(schema)) {
    const value = values[key];

    // Required check: Only throw if required and value is missing or empty string
    if (rule.required && (value == null || value === '')) {
      throw new Error(`${key} is required`);
    }

    // Only perform further validation if a value is actually present
    if (value != null && value !== '') {
      // Type validation
      if (rule.type && typeValidators[rule.type]) {
        // Await the type validator in case it's async
        await typeValidators[rule.type](values, key, rule);
      }

      // Enum check
      if (rule.enum && !rule.enum.includes(value)) {
        throw new Error(`${key} must be one of: ${rule.enum.join(', ')}`);
      }

      // Constraint validation
      checkConstraints(value, key, rule);
    }
  }

  // No need to await values here, it's just an object
  return values;
};

module.exports = { validate, sanitize };