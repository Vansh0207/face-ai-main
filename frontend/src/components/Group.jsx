import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import { FiDownload, FiCopy } from "react-icons/fi";

Modal.setAppElement("#root");

const GroupImages = () => {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [groupName, setGroupName] = useState(""); // Store group name
  const [groupUrl, setGroupUrl] = useState(""); // Store group name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/group/${id}`
        );
        console.log("response: ", response.data);

        setGroupName(response.data.name);
        setImages(response.data.photos);
        setGroupUrl(response.data.url);
      } catch (err) {
        setError("Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };
    fetchGroupData();
  }, [id]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(groupUrl);
    alert("Group URL copied to clipboard!");
  };

  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { mode: "no-cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      {/* Group Title & URL */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {groupName || "Group Images"}
        </h2>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 bg-gray-100 p-3 rounded-md shadow-md">
          {/* Group URL */}
          <span className="text-sm text-gray-700 font-medium break-all max-w-[80%] bg-white px-2 py-1 rounded-md border border-gray-300">
            {groupUrl}
          </span>

          {/* Copy Button */}
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <FiCopy className="text-lg" /> Copy URL
          </button>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => setSelectedImage(image.url)}
            >
              <img
                src={image.url}
                alt={`Group ${id}`}
                className="w-full h-40 object-contain transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition-opacity duration-500">
                View Image
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full">No images found.</p>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <Modal
          isOpen={true}
          onRequestClose={() => setSelectedImage(null)}
          overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          className="relative bg-white rounded-lg shadow-lg p-4 max-w-lg w-full"
        >
          <button
            className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-xl"
            onClick={() => setSelectedImage(null)}
          >
            ✖
          </button>
          <img
            src={selectedImage}
            alt="Full Size"
            className="max-w-full max-h-[80vh] mx-auto rounded-lg"
          />
          <a
            href={selectedImage}
            download={`image_${Date.now()}.jpg`}
            onClick={(e) => {
              e.preventDefault();
              handleDownload(selectedImage);
            }}
            className="flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mt-4"
          >
            <FiDownload className="text-lg" /> Download Image
          </a>
        </Modal>
      )}
    </div>
  );
};

export default GroupImages;
