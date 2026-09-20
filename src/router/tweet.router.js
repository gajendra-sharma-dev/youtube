import { Router } from "express";
import {postTwitter, updatetweet,deletetweet,getUserTweets} from "../controllers/tweet.controllers.js";
import { verfiyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verfiyJwt);

router.route("/").post(postTwitter);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updatetweet).delete(deletetweet);

export default router;