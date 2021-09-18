const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../controllers/requireLogin");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.get('/user/:id',(req,res)=>{
    User.findOne({_id:req.params.id})
    .select("-password")
    .then(user=>{
        Post.find({postedBy:req.params.id})
        .populate("postedBy","_id name")
        .then(posts=>{
            res.json({user,posts})
        })
    })
    .catch(err=>{
        return res.status(404).json({error:"User not found"})
    })
})

module.exports = router;