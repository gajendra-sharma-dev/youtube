import { Router } from "express";
import { getComment,getVideoComment,deleteComment, updateComment } from "../controllers/comment.controllers.js";
import {verfiyJwt} from "../middlewares/auth.middleware.js"



const router = Router()
router.use(verfiyJwt);

router.route("/c/:videoId").get(getVideoComment)
router.route("/:videoId").post(getComment)
router.route("/c/:commentId").patch(updateComment)
router.route("/c/:commentId").delete(deleteComment)


export default router;