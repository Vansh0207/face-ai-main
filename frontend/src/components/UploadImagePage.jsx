import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";
import { useSelector } from "react-redux";

export default function UploadImagePage() {
  const [groupName, setGroupName] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user } = useSelector((store) => store.auth);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleDeleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
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

    try {
      // Step 1: Upload images to Node.js backend
      const formData = new FormData();
      images.forEach((image) => {
        formData.append("images", image);
      });

      console.log("FormData before sending:", formData.getAll("images"));

      const uploadResponse = await axios.post(
        "http://localhost:8000/api/group/upload-images",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedPhotos = uploadResponse.data.urls; // Array of Cloudinary URLs

      // Step 2: Send Cloudinary URLs to Python backend for encoding
      const encodingResponse = await axios.post(
        "http://127.0.0.1:5000/encode-multiple",
        {
          images: uploadedPhotos,
        }
      );

      const photosWithEncodings = encodingResponse.data.results.map((item) => ({
        url: item.image_url,
        encoding: Array.isArray(item.encodings)
          ? item.encodings.map(Number)
          : [],
      }));

      // Step 3: Send final data to Node.js backend to store in MongoDB
      const groupResponse = await axios.post(
        "http://localhost:8000/api/group/create-group",
        {
          userId: user._id,
          groupName,
          photos: photosWithEncodings,
        }
      );

      const groupId = groupResponse.data.groupId;
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

      <label className="cursor-pointer mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition">
        Select Images
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt="Selected"
                className="w-28 h-28 object-cover rounded-lg shadow-md"
              />
              <button
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                onClick={() => handleDeleteImage(index)}
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload & Create Group"}
      </button>
    </div>
  );
}
