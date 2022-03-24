const express = require('express');
const slugify = require('slugify');
const router = express.Router();
const Cart = require('../models/cart')
const requireSignin = require('../common-middleware');

router.post('/addtocart', requireSignin, (req, res) => {


    Cart.findOne({ user: req.user._id })
        .exec((error, cart) => {
            if (error) return res.status(400).json({ error })
            if (cart) {
                // if cart already exists we need to update cart
                const product = req.body.cartItems.product;
                const item = cart.cartItems.find(c => c.product == product);

                if (item) {
                    //updating quantity in cart
                    Cart.findOneAndUpdate({ user: req.user._id, "cartItems.product": product }, {
                        "$set": {
                            "cartItems.$": {
                                ...req.body.cartItems,
                                quantity: item.quantity + req.body.cartItems.quantity
                            }
                        }
                    })
                } else {
                    //updating item in cart
                    Cart.findOneAndUpdate({ user: req.user._id }, {
                        "$push": {
                            "cartItems": req.body.cartItems
                        }
                    })
                        .exec((error, _cart) => {
                            if (error) return res.status(400).json({ error })
                            if (_cart) {
                                return res.status(200).json({ _cart })
                            }
                        })
                }

            } else {
                // if cart didnt exists we need to create cart

                const cart = new Cart({
                    user: req.user._id,
                    cartItems: req.body.cartItems
                })

                cart.save((error, _cart) => {
                    if (error) return res.status(400).json({ error })
                    if (_cart) {
                        return res.status(200).json({ _cart })
                    }
                })
            }
        })


})

module.exports = router;

