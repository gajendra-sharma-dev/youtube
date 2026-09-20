import {asynchandler } from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js";
import {Apiresponse}  from "../utils/Apiresponse.js"
import mongoose from "mongoose";
import {Like} from "../models/likes.models.js"


const toggleVideoLike = asynchandler(async(req,res)=>{
    const {videoId}  = req.params

    if(!mongoose.isValidObjectId(videoId)) {
        throw new Apierror(400,"video id does not exist")
    }

    const isExiting = await Like.findOne({
        video:videoId,
        likeBy:req.user?._id
    })

    if(isExiting) {
        await Like.findByIdAndDelete(isExiting._id)
    
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


const toggleCommentLike = asynchandler(async(req,res)=>{
    const {commentId} = req.params

    if(!mongoose.isValidObjectId(commentId)){
        throw new Apierror(400,"comment id does not exit")
    }
    const isExiting = await Like.findOne(
        {
            comment:commentId,
            likeBy:req.user?._id
        }
    )
        if(isExiting){
             await Like.findByIdAndDelete(isExiting._id)
            return res.status(200).
            json(new Apiresponse(200,{isLike : false},"comment unlike successfully"))
        }
    await Like.create({
        comment:commentId,
        likeBy:req.user?._id
    })

   return res.status(200).
    json(new Apiresponse(200,{islike:true},"comment like successfully"))

})

const toggleTweetLike = asynchandler(async(req,res)=>{
     const {tweetId} = req.params

    if(!mongoose.isValidObjectId(tweetId)){
        throw new Apierror("tweet id does not exit")
    }
    const isExiting = await Like.findOne(
        {
            tweet:tweetId,
            likeBy:req.user?._id
        }
    )
        if(isExiting){
             await Like.findByIdAndDelete(isExiting._id)
            return res.status(200).
            json(new Apiresponse(200,{isLike : false},"tweet unlike successfully"))
        }
    await Like.create({
       tweet:tweetId,
       likeBy:req.user?._id
    })

  return  res.status(200).
    json(new Apiresponse(200,{islike:true},"tweet like successfully"))

})

// 4. Get all liked videos (by current user)
const getLikedVideos = asynchandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user?._id,
    video: { $ne: null }   // sirf wahi jaha "video" field bhari hai
  }).populate("video", "title thumbnail duration views");

  return res
    .status(200)
    .json(new Apiresponse(200, likedVideos, "Liked videos fetched successfully"));
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}