// require('dotenv').config("./env")
import dotenv from "dotenv"
import connectDB from "./db/db.js"
import express from "express"
const app = express()
let port = process.env.PORT || 2000;

dotenv.config({
    path:"./env"
})

connectDB().then(()=>{
     app.listen(port,()=>{
    console.log(`app is listning on ${port}`);
    
  })
})
.catch((Error) => {
    console.log(`connection failed with database ${Error}`);
    
})