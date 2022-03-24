const express = require('express');
const path = require('path');
const multer = require('multer');
const shortid = require('shortid');
const slugify = require('slugify');
const router = express.Router();
const Product = require('../models/product')
const requireSignin = require('../common-middleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, path.join(path.dirname(__dirname),'uploads'))
    },
    filename: function (req, file, cb){
        cb(null,shortid.generate()+'-'+file.originalname )
    }
})

const upload = multer({storage})

router.post('/create',requireSignin,upload.array('productPicture'),(req,res)=>{

// res.status(200).json({
//     file: req.files, body: req.body
// })  

const { name, price, description, category, quantity, createdBy } = req.body;
let productPictures = [];

if (req.files.length > 0) {
  console.log('>>>req.length', req.files.length)
  productPictures = req.files.map((file) => {
    console.log('>>>loc',file)
    return { img: file.filename };
  });
}
console.log('>>>>.category',category)
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



module.exports = router;

