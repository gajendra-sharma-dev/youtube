// controllers/subcription.controllers.js
import mongoose from "mongoose";
import { Subcription } from "../models/subcription.models.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// 1. Toggle subscription (subscribe/unsubscribe)
const toggleSubscription = asynchandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new Apierror(400, "Invalid channel id");
  }

  // Khud khud ko subscribe nahi kar sake
  if (channelId === req.user?._id.toString()) {
    throw new Apierror(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subcription.findOne({
    Subcriber: req.user?._id,
    channal: channelId
  });

  if (existingSubscription) {
    await Subcription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new Apiresponse(200, { isSubscribed: false }, "Unsubscribed successfully"));
  }

  await Subcription.create({
    Subcriber: req.user?._id,
    channal: channelId
  });

  return res
    .status(200)
    .json(new Apiresponse(200, { isSubscribed: true }, "Subscribed successfully"));
});

// 2. Get subscribers of a channel
const getChannelSubscribers = asynchandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new Apierror(400, "Invalid channel id");
  }

  const subscribers = await Subcription.find({ channal: channelId })
    .populate("Subcriber", "username avatar fullName");

  return res
    .status(200)
    .json(new Apiresponse(200, subscribers, "Subscribers fetched successfully"));
});

// 3. Get channels that a user has subscribed to
const getSubscribedChannels = asynchandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!mongoose.isValidObjectId(subscriberId)) {
    throw new Apierror(400, "Invalid subscriber id");
  }

  const subscribedChannels = await Subcription.find({ Subcriber: subscriberId })
    .populate("channal", "username avatar fullName");

  return res
    .status(200)
    .json(new Apiresponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
});

export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };