import {asynchandler } from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js";
import {Apiresponse}  from "../utils/Apiresponse.js"

import {Tweet}  from "../models/tweets.models.js"

import mongoose from "mongoose";


const postTwitter = asynchandler(async(req,res)=>{
    const {tweets} = req.body

     if(!tweets) {
      throw new Apierror(400,"tweets is required")
     }

     const tweet = await Tweet.create({
        content:tweets,
        owner:req.user._id
     })

     return res.status(201).json(new Apiresponse(201,tweet,"Tweet created successfully"))
})

const updatetweet = asynchandler(async(req,res)=>{
    const {tweetId} = req.params
    const {tweets} = req.body

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new Apierror(400,"Invalid tweetId")
    }

   
    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new Apierror(404,"Tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new Apierror(403,"You are not authorized to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: tweets
        },
        {
            new: true
        }
    )

    return res.status(200).json(new Apiresponse(200, updatedTweet, "Tweet updated successfully"))
})


   const deletetweet = asynchandler(async(req,res)=>{
   
    const {tweetId} = req.params

     if(!mongoose.isValidObjectId(tweetId)){
        throw new Apierror(400,"Invalid tweetId")
     }

      const tweet = await Tweet.findById(tweetId)
       if(!tweet){
         throw new Apierror(400,"tweet does not exit")
       }
   
        if(tweet.owner.toString() !== req.user._id.toString()){
        throw new Apierror(403,"You are not authorized to update this tweet")
    }

      await  findByIdAnddelete(tweetId)

      res.status(200).
      json(200,{},"tweet delete successfully")

   })

   const getUserTweets = asynchandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new Apierror(400, "Invalid user id");
  }

  const tweets = await Tweet.find({ owner: userId })
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new Apiresponse(200, tweets, "User tweets fetched successfully"));
});
export {postTwitter, updatetweet,deletetweet,getUserTweets}