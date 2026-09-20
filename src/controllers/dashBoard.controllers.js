// controllers/dashboard.controllers.js
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subcription } from "../models/subcription.models.js";
import { Like } from "../models/likes.models.js";

import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// 1. Get channel stats
const getChannelStats = asynchandler(async (req, res) => {
  const userId = req.user?._id;

  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" }
      }
    }
  ]);

  const totalSubscribers = await Subcription.countDocuments({
    channal: userId    
  });

  const totalLikes = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails"
      }
    },
    {
      $unwind: "$videoDetails"
    },
    {
      $match: {
        "videoDetails.owner": new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $count: "totalLikes"
    }
  ]);

  const stats = {
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalSubscribers,
    totalLikes: totalLikes[0]?.totalLikes || 0
  };

  return res
    .status(200)
    .json(new Apiresponse(200, stats, "Channel stats fetched successfully"));
});

// 2. Get all videos uploaded by the channel
const getChannelVideos = asynchandler(async (req, res) => {
  const userId = req.user?._id;

  const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new Apiresponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };