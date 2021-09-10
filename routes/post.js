const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../controllers/requireLogin');
const Post = mongoose.model("Post");

router.post('/createpost',requireLogin,(req,res)=>{
    const {title,body,photo} = req.body;
    if(!title||!body||!photo){
        return res.status(422).json({error:"Please add all the fields"})
    }

    const post = new Post({
        title,
        body,
        photo,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})
module.exports = router;