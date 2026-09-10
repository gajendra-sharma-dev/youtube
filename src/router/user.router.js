import { Router } from "express";
import {registerUser,loginUser,logoutUser,refreshAccesstoken} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"
import {verfiyJwt} from "../middlewares/auth.middleware.js"

const router = Router()



router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
           name: "coverImage",
           maxCount:1
        }

    ]),
    
    registerUser)

router.route("/login").post(loginUser)

router.route("/refreshToken").post(refreshAccesstoken)


  //secure routes

  router.route("/logout").post(verfiyJwt,logoutUser)
export default router;