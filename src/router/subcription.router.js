import { Router } from "express";
import {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels
} from "../controllers/subcription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/c/:channelId")
  .post(toggleSubscription)
  .get(getChannelSubscribers);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;