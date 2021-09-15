require("dotenv").config()
const jwt = require("jsonwebtoken")

const getToken = user => {
    return jwt.sign(user, proces.env.JWT_SECRET, {
        expiresIn:"48h"
    })
}

const auth = (req,res,next) =>{
    const token = req.header("auth-token");
    if(!token) return res.status(401).send("Access Denied");

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        req.user = verified
        next()
    }catch(e){
        res.status(400).send("Invalid Token")
    }
}

module.exports = {getToken, auth}