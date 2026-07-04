
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
















const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary.js'); // Ensure this path is correct

const templateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'template_images', // Adjust as needed
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] // Adjust formats if needed
  }
});

const bochureStorage= new CloudinaryStorage({
  cloudinary:cloudinary,
  params:{
    folder:'brochure_Images',
    allowed_formats:['jpg','jpeg',"png","webp"]
  }
})

const gallerytorage= new CloudinaryStorage({
  cloudinary:cloudinary,
  params:{
    folder:'gallery_Images',
    allowed_formats:['jpg','jpeg',"png","webp"]
  }
})
const newsStorage= new CloudinaryStorage({
  cloudinary:cloudinary,
  params:{
    folder:'news_Images',
    allowed_formats:['jpg','jpeg',"png","webp"]
  }
})
const uploadTemplate = multer({ storage: templateStorage });
const uploadBrochure= multer({storage:bochureStorage})
const uploadGallery= multer({storage:gallerytorage})
const uploadNews= multer({storage:newsStorage})

const galleryImagesUpload = uploadGallery.single("image");
const newsImagesUpload = uploadNews.single("image");

const templateImagesUpload = uploadTemplate.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
 
]);

const brochureImageUpload= uploadBrochure.fields([
  {name:'image1', maxCount:1},
  {name:'image2', maxCount:1},
  {name:'image3', maxCount:1},

]
)



const settingsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'settings_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});
const uploadSettings = multer({ storage: settingsStorage });
const settingsImagesUpload = uploadSettings.fields([
  { name: 'bannerImage', maxCount: 1 },
  { name: 'rightImage', maxCount: 1 }
]);

const adsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ads_Images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});
const uploadAds = multer({ storage: adsStorage });
const adsImageUpload = uploadAds.single("image");

const templateSingleUpload = uploadTemplate.single("image");

module.exports={
    templateImagesUpload,
    brochureImageUpload,
    galleryImagesUpload,
    newsImagesUpload,
    settingsImagesUpload,
    adsImageUpload,
    templateSingleUpload
}




