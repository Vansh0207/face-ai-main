import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, unique: true },
    groupUrl: { type: String, unique: true },
    photos: [
      {
        url: { type: String, required: true }, // Photo URL
        encoding: { type: [Number], required: true }, // Encoding as an array of numbers
      },
    ],
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", groupSchema);
