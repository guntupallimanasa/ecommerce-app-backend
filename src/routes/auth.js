const express = require('express');
const router = express.Router();
const User = require('../models/userModel')
const jwt = require('jsonwebtoken'); 
const {validateSignupRequest,validateSigninRequest, isRequestValidated } = require('../validators/auth')
const requireSignin = require('../common-middleware');


router.post('/signin',validateSigninRequest, isRequestValidated,(req,res)=>{
  User.findOne({ email: req.body.email }).exec((error, user)=>{
    if(error) return res.status(400).json(error)
    if(user){
      if(user.authenticate(req.body.password)){
          
        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET,{expiresIn:'1h'})
        const { firstName, lastName, email, role, fullName } = user;
        res.cookie('token',token,{expiresIn:'1h'});
        res.status(200).json({
          token,
          user:{
            firstName, lastName, email, role, fullName
          }
        })
      }
    }else{
      return res.status(400).json({
        message: "Something went wrong",
      });
    }

})

})


router.post('/signup',validateSignupRequest, isRequestValidated,(req,res)=>{
    User.findOne({ email: req.body.email }).exec((error, user) => {
        if (user)
          return res.status(400).json({
            message: "User already registered",
          });
    
          const { firstName, lastName, email, password } = req.body;
          const _user = new User({
            firstName,
            lastName,
            email,
            password,
            username: Math.random().toString(),
            role:'admin'
          });
          _user.save(async (error, data) => {
            if (error) {
              return res.status(400).json({
                message: "Something went wrong",
              });
            }
    
              return res.status(201).json({
                message: "User created successfully"
              });
          });
      });
    
})


router.post('/signout',(req,res)=>{
 res.clearCookie('token');
 res.status(200).json({
  message: "Signout successfully"
});
})



module.exports = router;