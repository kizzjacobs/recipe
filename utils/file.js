const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { generateFileName } = require('./hash');

// A function to create a directory from the working dir if it doesn't exist
const createDirectory = path => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

// Generate unique filename using hash utility
const createFileName = (originalName) => {
  const extension = path.extname(originalName);
  const hashName = generateFileName('0xf');
  return `${hashName}${extension}`;
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../static/uploads');
    createDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = createFileName(file.originalname);
    cb(null, fileName);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

module.exports = {
  createDirectory,
  createFileName,
  upload
}
