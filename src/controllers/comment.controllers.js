import {asynchandler } from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js";
import {Apiresponse}  from "../utils/Apiresponse.js"
import mongoose from "mongoose";
import {Comment}   from "../models/comments.models.js"
import  {Video} from "../models/video.models.js"

   const getVideoComment = asynchandler(async(req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    

    if (!mongoose.isValidObjectId(videoId)) {
  throw new Apierror(400, "Invalid video id");
}

     const commentsAggregate =  await User.aggregate([
        {
            $match:{
                 video: new mongoose.Types.ObjectId(videoId)
            },

            $lookup:{
                from:"User",
          localField:"owner",
          foreignField:"_id",
          as:"owner",

          pipeline:[
             {
                $project:{
                    username,
                    avatar,
                    fullName
                }
             }
          ]

            }
        },
         {
      $addFields: {
        owner: { $first: "$owner" }
      }
    },
    {
        $sort:{createdAt: -1}
    }
     ])


        const options ={


 page: parseInt(page, 10),
   limit:  parseInt(limit, 10)

}
 const comments = await Comment.aggregatePaginate(commentsAggregate, options);
   


  return res
    .status(200)
    .json(new Apiresponse(200, comments, "Comments fetched successfully"));

  
});


const getComment = asynchandler(async(req,res)=>{
    const {videoId} = req.params
    const {content} = req.body

    if(content?.trim()) {
        throw new Apierror(400,"content is missing")
    }


    // Sirf format check kaafi hai, Video model ko touch mat karo
if (!mongoose.isValidObjectId(videoId)) {
  throw new Apierror(400, "Invalid video id");
}
// seedha comments fetch karo
// Video model se check karo — extra safety ke liye
const video = await Video.findById(videoId);
if (!video) {
  throw new Apierror(404, "Video not found");
}

 const comment = await Comment.create({
    content,
    video:videoId,
    owner:req.user?._id
 })


 if(!comment) {
    throw Apierror(500,"Failed to add comment, please try again")
 }
     return res.status(200).
     json(new Apiresponse(200,"comment add successfully"))
})

const updateComment = asynchandler(async(req,res)=>{
    const {commentId} = req.params
    const {newconetnt} = req.body
    if(!mongoose.isValidObjectId(commentId)){
     throw new Apierror(400, "Invalid comment id");
    }

   if(!newconetnt){
    throw new Apierror(400,"if you update comment please add newcomment")
   }

   
    const comment = await Comment.findById(commentId);
  if (!comment) {
  throw new Apierror(404, "comment not found");
}
   
 // Sirf comment ka owner hi update kar sake
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new Apierror(403, "You are not authorized to update this comment");
  }

      
 const updatecomment = await Comment.findByIdAndUpdate(
  commentId, 
  { content: newconetnt }, 
  { new: true }
);

res.send(200).
json(new Apiresponse(200,updatecomment,"your comment update"))

   
})

const deleteComment =  asynchandler(async(req,res)=>{
    const {commentId} = req.params

    if(!mongoose.isValidObjectId(commentId)){
   throw new Apierror(400, "Invalid  comment id");
    }
  

    const comment = await Video.findById(commentId);
if (!comment) {
  throw new Apierror(404, "Video not found");
}
   
  
  // Sirf comment ka owner hi delete kar sake
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new Apierror(403, "You are not authorized to delete this comment");
  }

   await Comment.findByIdAndDelete(commentId)

   res.status(200).
   json(200,{},"comment delete successfully")
})


export {getVideoComment,getComment,deleteComment,updateComment}