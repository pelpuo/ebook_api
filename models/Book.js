const mongoose = require("mongoose")
const Schema = mongoose.Schema

const BookSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    genre:{
        type:String,
        required:true
    },
    ageRating:{
        type:Number,
        required:true
    },
    fileUrl:{
        type:String
    },
    coverImage:{
        type:String
    },
    author:{
        type:String,
        required:true
    }
})

const Book = mongoose.model("book", BookSchema)
module.exports = Book