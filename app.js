require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 3000;

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('connected',()=>{
    console.log("Connected to mongoDB");
});

mongoose.connection.on('err',()=>{
    console.log("Could'nt connect to mongoDb");
});

app.get('/',(req,res)=>{
    res.send('Hello there')
})

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})