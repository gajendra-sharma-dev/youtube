import { Router } from "express";
import {postTwitter, updatetweet,deletetweet,getUserTweets} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(postTwitter);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updatetweet).delete(deletetweet);

export default router;