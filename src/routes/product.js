const express = require('express');
const path = require('path');
const multer = require('multer');
const shortid = require('shortid');
const slugify = require('slugify');
const router = express.Router();
const Product = require('../models/product')
const requireSignin = require('../common-middleware');
const Category = require('../models/categories');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), 'uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + '-' + file.originalname)
  }
})

const upload = multer({ storage })

router.post('/create', requireSignin, upload.array('productPicture'), (req, res) => {

  const { name, price, description, category, quantity, createdBy } = req.body;
  let productPictures = [];

  if (req.files.length > 0) {
    console.log('>>>req.length', req.files.length)
    productPictures = req.files.map((file) => {
      console.log('>>>loc', file)
      return { img: file.filename };
    });
  }
  console.log('>>>>.category', category)
  const product = new Product({
    name: name,
    slug: slugify(name),
    price,
    quantity,
    description,
    productPictures,
    category,
    createdBy: req.user._id,
  });

  product.save((error, product) => {
    if (error) return res.status(400).json({ error });
    if (product) {
      res.status(201).json({ product, files: req.files });
    }
  });
})

router.get('/products/:slug', (req, res) => {
  const { slug } = req.params;
  console.log('>>slug>>',slug)
  Category.findOne({ slug })
    .select('_id')
    .exec((error, category) => {
      if (error) return res.status(400).json({ error });
      if (category) {
        Product.find({ category: category._id })
          .exec((error, products) => {
            if (error) return res.status(400).json({ error });

            if (products.length > 0) {
              res.status(200).json({
                products,
                productsByPrice: {
                  under5K: products.filter(prod => prod.price <= 5000),
                  under10K: products.filter(prod => prod.price > 5000 && prod.price <= 10000),
                  under15K: products.filter(prod => prod.price > 10000 && prod.price <= 15000),
                  under20K: products.filter(prod => prod.price > 15000 && prod.price <= 20000),
                }
              });
            }
          })
      }
    })
})

router.get('/product/:productId', (req, res) => {
  const { productId } = req.params;

  if (productId) {
    Product.findOne({ _id: productId })
      .exec((error, product) => {
        if (error) return res.status(400).json({ error });
        if (product) {
          res.status(200).json({ product })
        }
      })
  } else {
    if (error) return res.status(400).json({ error: "Params Required" });
  }
})

module.exports = router;

