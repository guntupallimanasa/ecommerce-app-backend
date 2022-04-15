const express = require('express');
const router = express.Router();
const User = require('../models/userModel')
const jwt = require('jsonwebtoken'); 
const {validateSignupRequest,validateSigninRequest, isRequestValidated } = require('../validators/auth')
const requireSignin = require('../common-middleware');
const Order = require("../models/order");

router.post("/updateOrder", requireSignin, (req, res) => {
    Order.updateOne(
    { _id: req.body.orderId, "orderStatus.type": req.body.type },

        {
          $set: {
            "orderStatus.$": [
              { type: req.body.type, date: new Date(), isCompleted: true },
            ],
          },
        }
      ).exec((error, order) => {
        if (error) return res.status(400).json({ error });
        if (order) {
          res.status(201).json({ order });
        }
      });

});

router.post("/getCustomerOrders", requireSignin,async (req, res) => {
    const orders = await Order.find({})
    .populate("items.productId", "name")
    .exec();
  res.status(200).json({ orders });
});


module.exports = router;
