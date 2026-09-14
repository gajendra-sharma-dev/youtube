import {asynchandler } from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js";
import {Apiresponse}  from "../utils/Apiresponse.js"
import mongoose from "mongoose";
import {Like} from "../models/likes.models.js"


const toggleVideoLike = asynchandler(async(req,res)=>{
    const {videoId}  = req.params

    if(!mongoose.isValidObjectId(videoId)) {
        throw new Apierror(400,"video id does not exit")
    }

    const isExiting = await Like.findOne({
        video:videoId,
        likeBy:req.user?._id
    })

    if(isExiting) {
        await Like.findByIdAndUpdate(isExiting._id)
    
    return res.status(200).
    json(new Apiresponse(200,{isLike:false},"unlike successfully"))
    }

    await Like.create({
        video:videoId,
        likeBy:req.user?._id
    }
    )
    return res.status(200).
    json(new Apiresponse(200,{isLike:true},"video like successfully"))
})


const toggleCommentLike = asynchandler(async(res,req)=>{
    const {commment_id} = req.params

    if(!mongoose.isValidObjectId(commment_id)){
        throw new Apierror("comment id does not exit")
    }
    const isExiting = await Like.findOne(
        {
            comment:commment_id,
            likeBy:req.user?._id
        }
    )
        if(isExiting){
             await Like.findByIdAndUpdate(isExiting._id)
            return res.status(200).
            json(new Apiresponse(200,{isLike : false},"comment unlike successfully"))
        }
    await Like.create({
        comment:commment_id,
        likeBy:req.user?._id
    })

    res.status(200).
    json(200,{islike:true},"comment like successfully")

})

const toggleTweetLike = asynchandler(async(req,res)=>{
     const {tweet_id} = req.params

    if(!mongoose.isValidObjectId(tweet_id)){
        throw new Apierror("tweet id does not exit")
    }
    const isExiting = await Like.findOne(
        {
            tweet:tweet_id,
            likeBy:req.user?._id
        }
    )
        if(isExiting){
             await Like.findByIdAndUpdate(isExiting._id)
            return res.status(200).
            json(new Apiresponse(200,{isLike : false},"tweet unlike successfully"))
        }
    await Like.create({
       tweet:tweet_id,
       likeBy:req.user?._id
    })

    res.status(200).
    json(200,{islike:true},"tweet like successfully")

})

// 4. Get all liked videos (by current user)
const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user?._id,
    video: { $ne: null }   // sirf wahi jaha "video" field bhari hai
  }).populate("video", "title thumbnail duration views");

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}