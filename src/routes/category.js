const express = require('express');
const slugify = require('slugify');
const router = express.Router();
const Category = require('../models/categories')
const requireSignin = require('../common-middleware');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');


const createcategories=(categories, parentId=null)=>{
    const categoryList = [];
    let category;
    if(parentId == null){
        category = categories.filter(cat=> cat.parentId == undefined)
    }else {
        category = categories.filter(cat=> cat.parentId == parentId)
    }

    for(let cat of category){
        categoryList.push({
            _id:cat._id,
            name:cat.name,
            slug:cat.slug,
            parentId:cat.parentId,
            children:createcategories(categories, cat._id)
        })
    }
    return categoryList; 
}


const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, path.join(path.dirname(__dirname),'uploads'))
    },
    filename: function (req, file, cb){
        cb(null,shortid.generate()+'-'+file.originalname )
    }
})

const upload = multer({storage})

router.post('/create',requireSignin,upload.single('categoryImage'),(req,res)=>{

    const categoryObj = {
        name: req.body.name,
        slug: slugify(req.body.name)
    }
    if(req.file){
        categoryObj.categoryImage = "/public/" + req.file.filename;
    }

    if(req.body.parentId){
        categoryObj.parentId = req.body.parentId;
    }

    const cat = new Category(categoryObj);

    cat.save((error, category)=>{
            if(error) return res.status(400).json({error})
            if(category){
                return res.status(201).json({category});
            }
    })
})

router.get('/getCategories',(req,res)=>{
    Category.find({}).exec((error,category)=>{
        if(error){
            return res.status(400).json({error})
        }
        if(category){
            //sub categories logic
            const categoryList = createcategories(category)

            return res.status(200).json({categoryList})
        }
    })
})

module.exports = router;

