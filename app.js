require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const PORT = 3000;
const app = express();

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('connected',()=>{
    console.log("Connected to mongoDB");
});

mongoose.connection.on('err',()=>{
    console.log("Could'nt connect to mongoDb");
});

require('./models/user');       // this imports user scheme 

app.use(express.json());

app.use(require('./routes/auth'))

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})