const express = require('express');
const slugify = require('slugify');
const router = express.Router();
const Category = require('../models/categories')
const requireSignin = require('../common-middleware');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');


const createcategories = (categories, parentId = null) => {
    const categoryList = [];
    let category;
    if (parentId == null) {
        category = categories.filter(cat => cat.parentId == undefined)
    } else {
        category = categories.filter(cat => cat.parentId == parentId)
    }

    for (let cat of category) {
        categoryList.push({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId,
            type: cat.type,
            children: createcategories(categories, cat._id)
        })
    }
    return categoryList;
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname)
    }
})

const upload = multer({ storage })

router.post('/create', requireSignin, upload.single('categoryImage'), (req, res) => {

    const categoryObj = {
        name: req.body.name,
        slug: `${slugify(req.body.name)}- ${shortid.generate()}`
    }
    if (req.file) {
        categoryObj.categoryImage = "/public/" + req.file.filename;
    }

    if (req.body.parentId) {
        categoryObj.parentId = req.body.parentId;
    }

    const cat = new Category(categoryObj);

    cat.save((error, category) => {
        if (error) return res.status(400).json({ error })
        if (category) {
            return res.status(201).json({ category });
        }
    })
})

router.get('/getCategories', (req, res) => {
    Category.find({}).exec((error, category) => {
        if (error) {
            return res.status(400).json({ error })
        }
        if (category) {
            //sub categories logic
            const categoryList = createcategories(category)

            return res.status(200).json({ categoryList })
        }
    })
})


router.post('/updateCategories', upload.array('categoryImage'), async (req, res) => {

    const { _id, name, parentId, type } = req.body;
    const updatedCategories = [];
    if (name instanceof Array) {
        for (let i = 0; i < name.length; i++) {
            const category = {
                name: name[i],
                type: type[i],
            }
            if (parentId[i] !== "") {
                category.parentId = parentId[i]
            }
            const updateCategory = await Category.findOneAndUpdate({ _id: _id[i] }, category, { new: true })
            updatedCategories.push(updateCategory)
        }
        return res.status(200).json({ updatedCategories })
    } else {
        const category = {
            name,
            type,
        }
        if (parentId !== "") {
            category.parentId = parentId
        }
        const updateCategory = await Category.findOneAndUpdate({ _id }, category, { new: true })
    }
    return res.status(200).json({ updateCategory })
})

router.post('/deleteCategories', async (req, res) => {

    const { ids } = req.body.payload;
    const deletedCategories = [];
    for (let i = 0; i < ids.length; i++) {
        const deleteCategory = await Category.findOneAndDelete({ _id: ids[i]._id });
        deletedCategories.push(deleteCategory);
    }

    if (deletedCategories.length == ids.length) {
        res.status(200).json({ message: "Category removed" })
    } else {
        res.status(200).json({ message: "Something went wrong" })
    }
})

module.exports = router;

