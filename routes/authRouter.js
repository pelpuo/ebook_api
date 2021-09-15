require('dotenv').config()
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


Router.post("/register", upload.single('image'), [
    body("email").exists().isEmail(),
    body("password").exists(),
    body("first_name").exists(),
    body("last_name").exists(),
    body("phone_number").exists(),
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const emailExists = await User.findOne({email:req.body.email})
        if(emailExists)return res.status(400).json({message:"Email already in use"})
        
        const hash = await argon2.hash(req.body.password);
        let image_url;
        if(req.file)image_url = req.file.path

        const user = await User.create({
            email:req.body.email,
            password:hash,
            firstname:req.body.first_name,
            lastname:req.body.last_name,
            phone_number:req.body.phone_number
        }) 

        const savedUser = await user.save()
        res.status(201).json({"message":"Login successful"})


    }catch(e){
        res.status(400).json({message:e.message})
    }
})

Router.post("/login",[
    body("email").exists().isEmail(),
    body("password").exists(),
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const user = await User.findOne({email:req.body.email})
        if(!user)return res.status(400).json({message:"Invalid login credentials"})

        const validpwd = await argon2.verify(user.password, req.body.password)

        if(!validpwd)return res.status(400).json({message:"Invalid login credentials pwd"})


        // Create & Assign JWT
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET) 
        res.header("auth-token", token).json({message:"success"})


    }catch(e){
        res.status(400).json({message:e.message})
    }

})

module.exports = Router