const express = require('express');
const mongoose = require('mongoose');
const env = require('dotenv');
const authRoutes = require('./routes/auth')
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')
const cartRoutes = require('./routes/cart')
const pageRoutes = require('./routes/page')
const orderRoutes = require('./routes/order')
const adminOrderRoutes = require('./routes/adminOrderRoutes')
const addressRoutes = require('./routes/address')
const initialDataRoutes = require('./routes/initialData')
const path = require('path');
const cors = require('cors');

env.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "uploads")));

app.use('/api',authRoutes);
app.use('/api/category',categoryRoutes);
app.use('/api/',productRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/page',pageRoutes);
app.use('/api',initialDataRoutes);
app.use('/api',addressRoutes);
app.use('/api/order',orderRoutes);
app.use('/api/adminOrder',adminOrderRoutes);

app.get('/',(req,res,next)=>{
    res.status(200).json({
        message: "hello...."
    })
})

app.listen(process.env.PORT,()=>{
    console.log(`server is running at ${process.env.PORT}`)
})


mongoose.connect('mongodb+srv://test:manusankar@cluster0.fyur2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
   useNewUrlParser: true, useUnifiedTopology: true
  })
  .then(() => {
    console.log('mongodb connected::::::::')
  })
