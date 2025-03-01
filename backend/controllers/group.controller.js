import { User } from "../models/user.model.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import { Group } from "../models/group.model.js";
import mongoose from "mongoose";

export const uploadImages = async (req, res) => {
  try {
    const imageFiles = req.files; // Multer middleware should handle file parsing
    const uploadedUrls = [];

    if (!imageFiles) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    // If multiple files are uploaded, ensure it's an array
    const filesArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

    for (const file of filesArray) {
      const fileUri = getDataUri(file);
      //   console.log("Converted File URI:", fileUri);

      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      uploadedUrls.push(cloudResponse.secure_url);
    }

    res.status(200).json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "Failed to upload images." });
  }
};
export const createGroup = async (req, res) => {
  try {
    const { userId, groupName, photos } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create new group
    const newGroup = new Group({
      groupName,
      groupUrl: `/group/${groupName}`,
      photos,
    });

    await newGroup.save();

    // Update user's createdGroups
    user.createdGroups.push(newGroup._id);
    user.markModified("createdGroups"); // Ensure Mongoose detects the change
    await user.save();

    res.status(201).json({
      message: "Group created successfully",
      groupId: newGroup._id,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group." });
  }
};

export const getGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid group ID format" });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ photos: group.photos });
  } catch (error) {
    console.error("Error fetching group images:", error);
    res.status(500).json({ message: "Failed to fetch images" });
  }
};
