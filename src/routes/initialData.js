const express = require("express");
const router = express.Router();
const Category = require("../models/categories");
const Product = require("../models/product");
const Order = require("../models/order");

const createcategories = (categories, parentId = null) => {
  const categoryList = [];
  let category;
  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cat of category) {
    categoryList.push({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      type: cat.type,
      children: createcategories(categories, cat._id),
    });
  }
  return categoryList;
};

router.post("/initialData", async (req, res) => {
  const categories = await Category.find({}).exec();
  const products = await Product.find({})
    .select("_id name price quantity slug description productPictures category")
    .populate({ path: "category", select: "_id name" })
    .exec();
  const orders = await Order.find({})
  .populate("items.productId", "name")
  .exec();
  res.status(200).json({
    categories: createcategories(categories),
    products,
    orders,
  });
});

module.exports = router;
