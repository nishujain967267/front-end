// this routers are responsible for creating storing api and importing exporting api between the files.
// app ki jagah router word use kiya hai
// model ko use krke hi route ko banaya ja sakta hai.
const {Product} = require ('../models/product');
const express = require ('express');
const router = express.Router ();
const {Category} = require ('../models/category');
const mongoose = require ('mongoose');
const {route} = require ('./categories');
const multer = require ('multer');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage ({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error ('invalid image type');
    if (isValid) {
      uploadError = null;
    }
    cb (uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split (' ').join ('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb (null, `${fileName}-${Date.now ()}.${extension}`);
  },
});

const uploadOptions = multer ({storage: storage});

mongoose.set ('useFindAndModify', false);

//this is the get request isko data chaiye hota hai.
// apn ko kuch bhi dekhna ho database se ki wo data waha hai ya nhi hai aur hai toh kya hai toh usko apn access kr skte hai id ya parameter pass karke toh wo data postman me show ho jaeag get request ke through.
router.get (`/`, async (req, res) => {
  const productList = await Product.find ().populate ('category');
  // .select ('name image -_id')

  if (!productList) {
    res.status (500), json ({success: false});
  }
  res.send (productList);
});

//apn ko koi data database me se chaiye aur apn ko sirf id pass krwani hai aur data show ho jana chaiye toh uske liye ye wala kaam aa jaega api.
router.get (`/:id`, async (req, res) => {
  console.log ('das');
  const product = await Product.findById (req.params.id).populate ('category');
  if (!product) {
    res.status (500).json ({success: false});
  }
  res.send (product);
});

//post request jo hai wo kaam aati hai jab apn ko koi data database ke andr dalna hai toh apn ne jo model banaya hai uske hisab se apn data ko database ke andr daal skte hai taki baad me get request se wps data ko database ke andr se fetch kiya ja ske.
router.post ('/', uploadOptions.single ('image'), async (req, res) => {
  let category = await Category.findById (req.body.category);
  if (!category) return res.status (400).send ('Invalid Category');

  const file = req.file;
  if (!file) return res.status (400).send ('no image in the request');

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get ('host')}/public/uploads/`;
  const product = new Product ({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, //"http://localhost:3000/public/uploads/image-2323232",
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  console.log (product);
  // product = await product.save ();
  if (!product) return res.send (500).send ('The product cannot be created');
  await product.save ();
  res.send (product);
});
//updating the product using the put command of postman.
router.put ('/:id', async (req, re) => {
  if (!mongoose.isValidObjectId (req.params.id)) {
    res.status (400).send ('Invalid Product Id');
  }
  let category = await Category.findById (req.body.category);
  if (!category) return res.status (400).send ('Invalid Category');
  const product = await Product.findByIdAndUpdate (
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    {new: true}
  );
  if (!product) return res.status (500).send ('the product cannot be updated');
  res.send (product);
});
//deleting a product from the product list.
router.delete ('/:id', (req, res) => {
  Product.findByIdAndDelete (req.params.id)
    .then (product => {
      if (product) {
        return res
          .status (200)
          .json ({success: true, message: 'the product is deleted'});
      } else {
        return res
          .status (404)
          .json ({success: false, message: 'the product is not found'});
      }
    })
    .catch (err => {
      return res.status (500).json ({success: false, err: err});
    });
});
//get products count uisng the get method.
router.get (`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments (count => count);
  if (!productCount) {
    res.status (500).json ({success: false});
  }
  res.send ({productCount: productCount});
});
//featured products get request using postman.
router.get (`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find ({isFeatured: true}).limit (+count);
  if (!products) {
    res.status (500).json ({success: false});
  }
  res.send (products);
});
router.put (
  '/gallery-images/:id',
  uploadOptions.array ('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId (req.params.id)) {
      res.status (400).send ('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get ('host')}/public/uploads/`;
    if (files) {
      files.map (file => {
        imagesPaths.push (`${basePath}${file.fileName}`);
      });
    }
    const product = await Product.findByIdAndUpdate (
      req.params.id,
      {
        images: imagesPaths,
      },
      {new: true}
    );
    if (!product)
      return res.status (500).send ('the product cannot be updated');
    res.send (product);
  }
);
module.exports = router;
