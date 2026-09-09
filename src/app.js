import express from "express"
const app = express()
import cors from "cors"
import cookieParser from "cookie-parser"

app.use(cors( {
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))


app.use(express.json({limit:"16kb"}))  // req.body se data max size  16kb. data json me hoga jo frontent se aayaga
app.use(express.urlencoded({extended:true,limit:"16kb"}))  //yaha data html ke rup me aata hai usko samhe ke liye.
app.use(express.static("public"))


app.use(cookieParser())



//router

import userRouter  from "./router/user.router.js"


app.use("/api/v1/users",userRouter)  //https://localhost/api/v1/users/register  and /https://localhost/users/login




export {app}
