import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiCopy, FiDownload, FiX } from "react-icons/fi";

export default function GroupPage() {
  const { groupId } = useParams();
  const { user: reduxUser } = useSelector((store) => store.auth);
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [matchedImages, setMatchedImages] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Fetch User Details
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/user/${reduxUser._id}`
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (reduxUser?._id) {
      fetchUserData();
    }
  }, [reduxUser]);

  // Fetch Group Details
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/group/${groupId}`
        );
        setGroup(response.data);

        if (user?.groups?.includes(groupId)) {
          setShowPopup(false);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      }
    };

    if (user) fetchGroup();
  }, [groupId, user]);

  // Face Matching API Call
  useEffect(() => {
    const matchFaces = async () => {
      if (!user || !group || !user.faceEncoding || !group.photos.length) {
        return;
      }

      setIsMatching(true);
      try {
        const response = await axios.post("http://127.0.0.1:5000/compare", {
          selfie_encoding: user.faceEncoding,
          event_images: group.photos.map((photo) => photo.url),
        });

        if (response.data.match_found) {
          setMatchedImages(response.data.matched_images || []);
        } else {
          setMatchedImages([]);
        }
      } catch (error) {
        console.error("Error in face matching:", error);
      } finally {
        setIsMatching(false);
      }
    };

    if (user && group) {
      matchFaces();
    }
  }, [user, group]);

  const handleJoinGroup = async () => {
    setShowPopup(false);
    if (!user || !group) return;

    try {
      await axios.post("http://127.0.0.1:8000/api/group/join-group", {
        userId: user._id,
        groupId,
      });
      console.log("User joined group successfully");
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleCopyUrl = () => {
    if (group?.groupUrl) {
      navigator.clipboard.writeText(group.groupUrl);
      alert("Group URL copied!");
    }
  };

  const handleDownloadImage = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!group || !user) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {/* Join Group Popup */}
      {showPopup && !user.groups.includes(groupId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Join Group?</h2>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              onClick={handleJoinGroup}
            >
              Yes, Join
            </button>
          </div>
        </div>
      )}

      {/* Group Title */}
      <div className="mb-4">
        {group?.name ? (
          <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
        ) : (
          <p className="text-red-500">Group Name Not Found</p>
        )}
      </div>

      {/* Copy URL Section */}
      {group?.url && (
        <div className="flex items-center mt-4 bg-white p-3 rounded-lg shadow-md">
          <input
            type="text"
            value={group.url}
            readOnly
            className="border border-gray-300 px-4 py-2 rounded-l-md w-80 bg-gray-100"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md flex items-center hover:bg-blue-600 transition"
            onClick={handleCopyUrl}
          >
            <FiCopy className="mr-2" />
            Copy
          </button>
        </div>
      )}

      {/* Matched Images Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {isMatching ? (
          <p className="text-gray-500 col-span-2">Matching faces...</p>
        ) : matchedImages.length > 0 ? (
          matchedImages.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Matched Image ${index}`}
              className="w-40 h-40 rounded-lg cursor-pointer hover:scale-105 transition"
              onClick={() => setFullscreenImage(url)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-2">
            No photo of yours detected.
          </p>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-4">
          <div className="relative">
            <img
              src={fullscreenImage}
              alt="Full Screen"
              className="max-w-screen-md max-h-screen-md rounded-lg"
            />
            <button
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
              onClick={() => setFullscreenImage(null)}
            >
              <FiX />
            </button>
            <button
              className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition"
              onClick={() => handleDownloadImage(fullscreenImage)}
            >
              <FiDownload />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
