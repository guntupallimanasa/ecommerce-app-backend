const express = require('express');
const router = express.Router();
const Page = require('../models/page')
const requireSignin = require('../common-middleware');
const shortid = require('shortid');
const slugify = require('slugify');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname)
    }
})

const upload = multer({ storage })

router.post('/createPage', upload.fields([
    { name: 'banners' },
    { name: 'products' },
]), (req, res) => {
    const { banners, products } = req.files;

    if (banners.length > 0) {
        req.body.banners = banners.map((banner, index) => ({
            img: `/public/${banner.filename}`,
            navigateTo: `/bannerClicked?categoryId=${req.body.category}&type=${req.body.type}`
        }))
    }
    if (products.length > 0) {
        req.body.products = products.map((product, index) => ({
            img: `/public/${product.filename}`,
            navigateTo: `/productClicked?categoryId=${req.body.category}&type=${req.body.type}`
        }))
    }

    // req.body.createdBy = req.user._id;
    
     Page.findOne({ category: req.body.category })
        .exec((error, page) => {
            if (error) return res.status(400).json({ error });
            if (page) {
                Page.findOneAndUpdate({ category: req.body.category }, req.body)
                    .exec((error, updatePage) => {
                        if (error) return res.status(400).json({ error });
                        if (updatePage) {
                            return res.status(201).json({ page: updatePage });
                        }
                    })
            } else {
                const page = new Page(req.body);

                page.save((error, page) => {
                    if (error) return res.status(400).json({ error });
                    if (page) {
                        return res.status(201).json({ page });
                    }
                })
            }
        })

})

router.get('/:category/:type', (req, res) => {
    const {category, type} = req.params;

    if(type == 'page'){
        Page.findOne({category})
        .exec((error, page)=>{
            if (error) return res.status(400).json({ error });
            if (page) {
                return res.status(200).json({ page });
            }
        })
    }
})



module.exports = router;

