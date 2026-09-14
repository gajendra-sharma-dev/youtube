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
import commentRouter from "./router/comment.router.js"
import dashBoardRouter from "./router/dashBoard.roter.js"
import  healthcheck  from "./router/health.router.js"
import playListRouter from "./router/playlist.router.js"
import likeRouter from "./router/like.router.js"
import tweetRouter from "./router/tweet.router.js"
import videoRouter from "./router/video.router.js"
import subcriptionRouter from "./routes/subcription.routes.js";


app.use("/api/v1/users",userRouter)  //https://localhost/api/v1/users/register  and /https://localhost/users/login

app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/dashboard",dashBoardRouter)
app.use("api/v1/healthcheck",healthcheck)
app.use("/api/v1/playlist",playListRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subcriptionRouter);





app.use((err, req, res, next) => {
    console.error(err)   // terminal mein poora error dikhega
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
})

export {app}
