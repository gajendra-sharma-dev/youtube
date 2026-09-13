import { Router } from "express";
import { getComment,getVideoComment,deleteComment, updateComment } from "../controllers/comment.controllers.js";
import {verfiyJwt} from "../middlewares/auth.middleware.js"



const router = Router()
router.use(verfiyJwt);

router.route("/c/:commentId").get(getVideoComment)
router.route("/commentId").post(getComment)
router.route("/c/:commentId").delete(updateComment)
router.route("/c/:commentId").delete(deleteComment)


export default router;