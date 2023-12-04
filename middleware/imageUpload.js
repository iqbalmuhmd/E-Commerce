const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { v4 } = require('uuid');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

// Products
exports.uploadProductImages = upload.fields([
  {
    name: 'images',
    maxCount: 3
  }
]);

exports.resizeProductImages = async (req, res, next) => {
  if (!req.files.images) return next();

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file) => {
      const filename = `product-${v4()}.jpeg`;

      await sharp(file.buffer)
        .resize(640, 640)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(__dirname, '../public', 'products', filename));

      req.body.images.push(filename);
    })
  );

  next();
};
