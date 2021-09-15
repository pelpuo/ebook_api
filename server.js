// Importing dependencies
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")



// Importing Routers
const authRouter = require("./routes/authRouter")
const userRouter = require("./routes/userRouter")
const bookRouter = require("./routes/bookRouter")


// Initializing app
const app = express()
app.use(cors())

app.use("/uploads", express.static("uploads"))

app.use(express.urlencoded({extended:true}))



// Connecting Mongoose
const connect = async() => {
    try{
        await mongoose.connect(process.env.MONGO_DB, {
            useNewUrlParser:true, 
            useUnifiedTopology:true, })
        .then(() => console.log(`Database connected`))
    }catch(e){
        console.log(e)
    }
}

connect()

const db = mongoose.connection
db.on("error", (e)=>console.error(e))


// Adding middleware
app.use(express.json())



// Adding Routers
app.use("/", authRouter)
app.use("/user", userRouter)
app.use("/book", bookRouter)



// if URL path matches none on our above routes, 
// throw 404 http error message
app.use((req, res, next) => {
    const error = new Error('Page not found');
    error.status = 404;
    next(error);
})

//sending back error messages.
//all the errors thrown with the next() ifromn the routes will be
//handled here 
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message })
});




// Defining Port
const PORT = process.env.PORT || 3000

// Running server
app.listen(PORT, ()=>console.log(`Listening on port ${PORT}`))