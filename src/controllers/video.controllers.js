import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// 1. Get all videos (search, sort, pagination)
const getAllVideos = asynchandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const filter = { isPublished: true };

  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }

  if (userId && mongoose.isValidObjectId(userId)) {
    filter.owner = userId;
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  const videos = await Video.find(filter)
    .populate("owner", "username avatar")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber);

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new Apiresponse(
      200,
      {
        videos,
        totalVideos,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalVideos / limitNumber)
      },
      "Videos fetched successfully"
    )
  );
});

// 2. Publish a video
const publishVideo = asynchandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new Apierror(400, "title and description is required");
  }

  const videoLocalpath = req.files?.videoFiles?.[0]?.path;
  const thumbnailLocalpath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalpath) {
    throw new Apierror(400, "video is required");
  }
  if (!thumbnailLocalpath) {
    throw new Apierror(400, "thumbnail is required");
  }

  const videoFiles = await uploadCloudinary(videoLocalpath);
  const thumbnail = await uploadCloudinary(thumbnailLocalpath);

  if (!videoFiles) {
    throw new Apierror(400, "failed to upload video, please try again later");
  }
  if (!thumbnail) {
    throw new Apierror(400, "failed to upload thumbnail, please try again later");
  }

  const video = await Video.create({
    title,
    description,
    videoFiles: videoFiles.url,
    thumbnail: thumbnail.url,
    duration: videoFiles.duration,
    owner: req.user?._id
  });

  if (!video) {
    throw new Apierror(500, "Failed to publish video, please try again");
  }

  return res
    .status(201)
    .json(new Apiresponse(201, video, "video published successfully"));
});

// 3. Get video by id
const getVideoById = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new Apierror(400, "video id is required");
  }

  const video = await Video.findById(videoId).populate("owner", "username avatar");

  if (!video) {
    throw new Apierror(400, "video is not found");
  }

  video.views += 1;
  await video.save();

  return res
    .status(200)
    .json(new Apiresponse(200, video, "video fetched successfully"));
});

// 4. Update video
const updateVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new Apierror(400, "video id for update not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new Apierror(400, "video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new Apierror(403, "you are not authorized to update this video");
  }

  const updatefiled = {};
  if (title?.trim()) updatefiled.title = title;
  if (description?.trim()) updatefiled.description = description;

  const thumbnailLocalpath = req.file?.path;   // single file upload

  if (thumbnailLocalpath) {
    const thumbnail = await uploadCloudinary(thumbnailLocalpath);
    if (!thumbnail) {
      throw new Apierror(400, "uploading failed please try again later");
    }
    updatefiled.thumbnail = thumbnail.url;
  }

  const updateDetail = await Video.findByIdAndUpdate(
    videoId,
    { $set: updatefiled },
    { new: true }
  );

  return res
    .status(200)
    .json(new Apiresponse(200, updateDetail, "updated video successfully"));
});

// 5. Delete video
const deleteVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new Apierror(400, "video id is not valid");
  }

  const video = await Video.findById(videoId);

  if (!video) {                                          
    throw new Apierror(400, "video you want to delete not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {   
    throw new Apierror(403, "you are not authorized to delete this video");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "video is successfully deleted"));
});

// 6. Toggle publish status
const togglePublishStatus = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new Apierror(400, "video id not valid for togglePublishStatus");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new Apierror(400, "video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {   
    throw new Apierror(403, "you are not authorized to modify video");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new Apiresponse(200, video, "publish status fetched successfully"));
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
};
