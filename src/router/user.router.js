import { Router } from "express";
import {registerUser,
      loginUser,
      logoutUser,
      refreshAccesstoken,
      changeCurrentPassword,
      getCurrentUser,
      updateAccoutDetail,
      updateAvatar,
      updatecoverImage,
      getUserChannelProfile,
      getwatchHistory
    }    from "../controllers/user.controllers.js"
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

 router.route("/logout").post(verfiyJwt,logoutUser)

router.route("/refreshToken").post(refreshAccesstoken)

router.route("/logout").post(verfiyJwt,logoutUser)

router.route("/changepassword").post(verfiyJwt,changeCurrentPassword)

router.route("/getCurrentuser").post(verfiyJwt,getCurrentUser)

router.route("/updatedetail").patch(verfiyJwt,updateAccoutDetail)

router.route("/avatar").patch(verfiyJwt,upload.single("avatar"),updateAvatar)

router.route("/coverImage").patch(verfiyJwt,upload.single("coverImage"),updatecoverImage)

router.route("/c/:username").get(verfiyJwt,getUserChannelProfile)                                                       //ager req.params se data aayaga to route esa bange
   
router.route("/history").get(verfiyJwt,getwatchHistory)





export default router;