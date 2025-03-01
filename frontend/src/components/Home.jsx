import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const userId = user?._id;
  const [createdGroups, setCreatedGroups] = useState([]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        console.log("Fetching groups for userId:", userId);
        if (!userId) return;

        const response = await axios.get(
          `http://localhost:8000/api/user/groups?userId=${userId}`,
          { withCredentials: true }
        );

        setCreatedGroups(response.data.createdGroups);
      } catch (error) {
        console.error("Failed to fetch user groups:", error);
      }
    };

    fetchUserGroups();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center p-8">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-10 drop-shadow-lg">
        Your Folders
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-5xl">
        {/* New Folder Button */}
        <button
          className="w-36 h-36 bg-[#2A3B5F] hover:bg-[#1C2A47] text-white flex flex-col items-center justify-center rounded-xl shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          onClick={() => navigate("/upload-image")}
        >
          <FaPlus className="text-5xl" />
          <span className="mt-2 text-md font-semibold">New Folder</span>
        </button>

        {/* User Created Groups */}
        {createdGroups.length > 0 ? (
          createdGroups.map((group) => (
            <div
              key={group._id}
              className="w-36 h-36 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-2xl shadow-lg text-gray-900 font-semibold text-lg cursor-pointer border border-gray-300 hover:shadow-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-lg"
              onClick={() => navigate(`/group/${group._id}`)}
            >
              <img
                src={group.photos[0]?.url || "https://via.placeholder.com/150"}
                alt={group.groupName}
                className="w-20 h-20 object-cover rounded-full mb-3 shadow-md border-2 border-gray-200"
              />
              <span className="text-sm text-center px-2 truncate w-full">
                {group.groupName}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-700 text-lg col-span-full mt-6 text-center italic opacity-80">
            🚀 You haven't created any groups yet. Start organizing now!
          </p>
        )}
      </div>
    </div>
  );
}
