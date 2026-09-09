// require('dotenv').config("./env")
import dotenv from "dotenv"
import connectDB from "./db/db.js"
import {app} from "./app.js"

let port = process.env.PORT
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