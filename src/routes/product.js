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
    productPictures = req.files.map((file) => {
      return { img: file.filename };
    });
  }
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
  Category.findOne({ slug })
    .select('_id type')
    .exec((error, category) => {
      if (error) return res.status(400).json({ error });
      if (category) {
        Product.find({ category: category._id })
          .exec((error, products) => {
            if (error) return res.status(400).json({ error });
            if(category.type){
              if (products.length > 0) {
                res.status(200).json({
                  products,
                  priceRange: {
                    under5k: 5000,
                    under10k: 10000,
                    under15k: 15000,
                    under20k: 20000,
                    under30k: 30000,
                  },
                  productsByPrice: {
                    under5K: products.filter(prod => prod.price <= 5000),
                    under10K: products.filter(prod => prod.price > 5000 && prod.price <= 10000),
                    under15K: products.filter(prod => prod.price > 10000 && prod.price <= 15000),
                    under20K: products.filter(prod => prod.price > 15000 && prod.price <= 20000),
                  }
                });
              }
            }else{
              res.status(200).json({products});
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

router.delete('/product/deleteProductById',requireSignin, (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    Product.deleteOne({ _id: productId }).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
})

router.post('/product/getProducts',requireSignin,async (req, res) => {
  const products = await Product.find({ createdBy: req.user._id })
  .select("_id name price quantity slug description productPictures category")
  .populate({ path: "category", select: "_id name" })
  .exec();

res.status(200).json({ products });
})


module.exports = router;

