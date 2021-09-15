require("dotenv").config()
const Router = require("express").Router()
const User = require("./../models/User")
const { body, header, validationResult } = require('express-validator');
const argon2 = require("argon2")
const jwt = require("jsonwebtoken")
const {auth} = require("./../util")
const multer  = require('multer')
const fs = require('fs');
const path = require("path")

// Image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });


// Get all users
Router.get("/", auth, async(req,res)=>{
    res.status(200).json({message:"User Router"})
})

// Get single user
Router.get("/:userId", auth, [
    header("userId").exists()
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const user = await User.findById(req.params.userId)
        res.status(200).json({"user":user})


    }catch(e){
        res.status(400).json(e)
    }


})

// Update a user
Router.put("/:userId", auth, upload.single('image'),[
    body("email").exists().isEmail(),
    body("password").exists(),
    body("firstname").exists(),
    body("lastname").exists(),
    body("phone_number").exists(),
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{

        const updatedUser = await User.findByIdAndUpdate(req.params.userId, {
            firstname:req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            phone_number: req.body.phone_number
        })
        res.status(200).json({message:"success"})
    
    }catch(e){
        res.status(400).json(e)
    }


})

// Delete a user
Router.delete("/:userId", [
    header("userId").exists()
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const user = await user.findById(req.params.userId)
        if(user.userId != req.user._id){
            res.status(400).json("Forbidden")
        }

        await user.findByIdAndDelete(req.params.userId)
        res.status(200).json({message:"success"})
        
    }catch(e){
        res.status(400).json({message:e.message})
    }
})



module.exports = Router