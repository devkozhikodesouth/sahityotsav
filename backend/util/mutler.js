
const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, path.join(__dirname, "../public/results"));
//   },
//   filename: function (req, file, callback) {
//     const name = Date.now() + "-" + file.originalname;
//     callback(null, name);
//   },
// });

// const uploadProduct = multer({ storage: storage });

// const productImagesUpload = uploadProduct.fields([
//   { name: 'image1', maxCount: 1 },
//   { name: 'image2', maxCount: 1 },
//   { name: 'image3', maxCount: 1 },
 
// ]);

// module.exports={
//     productImagesUpload
// }
















const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

const templateImagesUpload = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 }
]);

const brochureImageUpload = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 }
]);

const galleryImagesUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images[]", maxCount: 50 },
  { name: "images", maxCount: 50 }
]);

const newsImagesUpload = upload.single("image");

const settingsImagesUpload = upload.fields([
  { name: 'bannerImage', maxCount: 1 },
  { name: 'rightImage', maxCount: 1 }
]);

const adsImageUpload = upload.single("image");

const templateSingleUpload = upload.single("image");

module.exports = {
  templateImagesUpload,
  brochureImageUpload,
  galleryImagesUpload,
  newsImagesUpload,
  settingsImagesUpload,
  adsImageUpload,
  templateSingleUpload
};




