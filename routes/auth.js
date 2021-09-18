const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const requireLogin = require("../controllers/requireLogin");
const SibApiV3Sdk = require("sib-api-v3-sdk");

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(422).json({ error: "please add all the fields" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (savedUser) {
      return res
        .status(422)
        .json({ error: "user already exists with that email" });
    }

    bcrypt.hash(password, 12).then((hashedpassword) => {
      const user = new User({
        name,
        email,
        password: hashedpassword,
      });

      user
        .save()
        .then((user) => {
          res.json({ message: "saved successfully" });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please input email or password" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid Email or Password" });
    }
    bcrypt.compare(password, savedUser.password).then((doMatch) => {
      if (doMatch) {
        const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
        res.json({ token, user: savedUser });
      } else {
        return res.status(422).json({ error: "Invalid Email or Password" });
      }
    });
  });
});

router.post("/reset-password", (req, res) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;

  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.MAIL_API;

  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: "User dont exists with that email" });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user
        .save()
        .then((result) => {
          return result;
        })
        .then((result) => {
          sendSmtpEmail.subject = "Your Requested for Password reset" ;
          sendSmtpEmail.htmlContent = `<p>You requested for password reset</p> 
          <h5>click in this <a href="https://cranky-bohr-49b41b.netlify.app/reset/${token}">link</a> to reset password</h5>`;
          sendSmtpEmail.sender = {
            name: "Infinity Support Team",
            email: "DanVonJohn@infinity.com",
          };
          sendSmtpEmail.to = [{ email: user.email, name:user.name }];
          console.log(sendSmtpEmail);
          apiInstance.sendTransacEmail(sendSmtpEmail).then(
            function (data) {console.log("API called successfully ");},
            function (error) {console.error(error)});
          res.json({ message: "check your email" });
        })
        .catch((err) => res.send({ error: err }));
    });
  });
});

router.post('/new-password',(req,res)=>{
  const newPassword = req.body.password
  const sentToken = req.body.token
  User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
  .then(user=>{
      if(!user){
          return res.status(422).json({error:"Try again session expired"})
      }
      bcrypt.hash(newPassword,12).then(hashedpassword=>{
         user.password = hashedpassword
         user.resetToken = undefined
         user.expireToken = undefined
         user.save().then((saveduser)=>{
             res.json({message:"password updated success"})
         })
      })
  }).catch(err=>{
      console.log(err)
  })
})

router.get("/", requireLogin, (req, res) => {
  res.send(req.user);
});

module.exports = router;
