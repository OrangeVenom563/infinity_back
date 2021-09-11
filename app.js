require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const PORT = 5000;
const app = express();

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('connected',()=>{
    console.log("Connected to mongoDB");
});

mongoose.connection.on('err',()=>{
    console.log("Could'nt connect to mongoDb");
});

require('./models/user');       // this imports user scheme 
require('./models/post'); 

app.use(express.json());

app.use(require('./routes/auth'));
app.use(require('./routes/post'));

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})