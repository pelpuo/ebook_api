const Router = require("express").Router()
const multer = require("multer")
const Book = require("./../models/Book")
const { body, header, validationResult } = require('express-validator');
const argon2 = require("argon2")
const jwt = require("jsonwebtoken")
const {auth} = require("./../util")
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
    if (file.mimetype == 'image/jpeg' || 
        file.mimetype == 'image/png' || 
        file.mimetype == 'application/pdf' || 
        file.mimetype == 'application/epub+zip') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });


// Get all books
Router.get("/", async(req,res)=>{
    try{
        const books = await Book.find()
        res.status(200).json(books)
    }catch(e){
        res.status(400).json({message:e.message})
    }
})


// Get single book
Router.get("/:bookId", [
    header("bookId").exists()
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const book = await Book.findById(req.params.bookId)
        res.status(200).json({"book":book})


    }catch(e){
        res.status(400).json(e)
    }
    
})

// Add book
Router.post("/", upload.fields([
    {name:"fileUrl", maxCount:1},
    {name:"coverImage", maxCount:1}
]),[
    body("name").exists(),
    body("description").exists(),
    body("author").exists(),
    body("genre").exists(),
    body("ageRating").exists(),
], async(req,res)=>{
    // console.log(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) { 
        return res.status(400).json({ errors: errors.array() });
    }
    
    let fileUrl = ""
    let coverImage = ""

    if(req.files.fileUrl[0])fileUrl = req.files.fileUrl[0].path
    if(req.files.coverImage[0])coverImage = req.files.coverImage[0].path

    try{

        const newBook = new Book({
            name:req.body.name,
            description: req.body.description,
            author: req.body.author,
            genre: req.body.genre,
            ageRating: req.body.ageRating,
            fileUrl:fileUrl,
            coverImage:coverImage
        })

        await newBook.save()

        res.status(200).json({message:"success", book:newBook})
    
    }catch(e){
        res.status(400).json(e)
    }



    

})


// Update a book
Router.put("/:bookId", auth,  
upload.fields([
    {name:"fileUrl", maxCount:1},
    {name:"coverImage", maxCount:1}
]),[
    header("bookId").exists(),
    body("name").exists(),
    body("description").exists(),
    body("author").exists(),
    body("genre").exists(),
    body("ageRating").exists(),
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let fileUrl = ""
    let coverImage = ""

    if(req.files.fileUrl[0])fileUrl = req.files.fileUrl[0].path
    if(req.files.coverImage[0])coverImage = req.files.coverImage[0].path


    try{

        const updatedBook = await Book.findByIdAndUpdate(req.params.bookId, {
            name:req.body.name,
            description: req.body.description,
            author: req.body.author,
            genre: req.body.genre,
            ageRating: req.body.ageRating,
            fileUrl:fileUrl,
            coverImage:coverImage
        })
        res.status(200).json({message:"success"})
    
    }catch(e){
        res.status(400).json(e)
    }



})

// Delete a book
Router.delete("/:bookId", auth, [
    header("bookId").exists()
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const book = await Book.findById(req.params.bookId)

        await book.findByIdAndDelete(req.params.bookId)
        res.status(200).json({message:"success"})
        
    }catch(e){
        res.status(400).json({message:e.message})
    }
    
})



module.exports = Router