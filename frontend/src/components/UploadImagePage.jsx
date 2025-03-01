import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UploadImagePage() {
  const [groupName, setGroupName] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleUpload = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    if (images.length === 0) {
      alert("Please select images to upload.");
      return;
    }

    setLoading(true);
    const uploadedPhotos = [];

    // Upload images to Cloudinary
    for (let image of images) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "your_cloudinary_preset"); // Replace with actual Cloudinary preset

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dvx67vfvh/image/upload",
          formData
        );

        uploadedPhotos.push({ url: response.data.secure_url });
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        alert("Failed to upload images. Please try again.");
        setLoading(false);
        return;
      }
    }

    // Send the URLs to the Python backend for encoding
    try {
      const encodingResponse = await axios.post(
        "http://127.0.0.1:5000/encode",
        {
          images: uploadedPhotos.map((photo) => photo.url),
        }
      );

      // Attach encodings to photos
      const photosWithEncodings = uploadedPhotos.map((photo, index) => ({
        url: photo.url,
        encoding: encodingResponse.data.encodings[index] || [],
      }));

      // Save group to MongoDB
      const groupResponse = await axios.post(
        "http://127.0.0.1:5000/save-group",
        {
          groupName,
          photos: photosWithEncodings,
        }
      );

      const groupId = groupResponse.data.groupId;
      const groupUrl = `https://yourwebsite.com/group/${groupId}`;

      alert("Images uploaded and group created successfully!");
      navigate(`/group/${groupId}`);
    } catch (error) {
      console.error("Error processing images:", error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Create a New Group
      </h1>

      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter group name"
        className="mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm w-80 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload & Create Group"}
      </button>
    </div>
  );
}
