import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiPlus } from "react-icons/fi";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: reduxUser } = useSelector((store) => store.auth);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupUrl, setGroupUrl] = useState("");

  // Fetch User Details
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/user/${reduxUser._id}`
        );
        setUser(response.data);
        setGroups(
          Array.isArray(response.data.groups) ? response.data.groups : []
        );
        console.log("Fetched groups:", response.data.groups);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (reduxUser?._id) {
      fetchUserData();
    }
  }, [reduxUser]);

  // Handle Join New Group
  const handleJoinGroup = async () => {
    if (!groupUrl.trim()) return;

    window.history.pushState(null, "", groupUrl);
    window.location.reload();
  };

  if (!user) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {/* Join New Group Button at the Top */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        <button
          className="mb-4 px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          onClick={() => setShowModal(true)}
        >
          <FiPlus className="mr-2" />
          Join New Group
        </button>
      </div>

      {/* Display the URL Section */}
      {groupUrl && (
        <div className="mt-4 p-3 bg-white border rounded-lg shadow">
          <span className="font-semibold">Entered Group URL:</span> {groupUrl}
        </div>
      )}

      {/* Dashboard Title */}
      <h1 className="text-3xl font-bold text-gray-800 my-6">Your Groups</h1>

      {/* Groups List (Grid Format) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={group._id}
              className="w-36 h-36 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-2xl shadow-lg text-gray-900 font-semibold text-lg cursor-pointer border border-gray-300 hover:shadow-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-lg"
              onClick={() => navigate(`/group/${group._id}`)}
            >
              <img
                src={
                  group?.photos?.length > 0
                    ? group.photos[0].url
                    : "https://via.placeholder.com/150"
                }
                alt={group.groupName || "Group Image"}
                className="w-20 h-20 object-cover rounded-full mb-3 shadow-md border-2 border-gray-200"
              />
              <span className="text-sm text-center px-2 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {group.groupName}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center w-full">
            You are not part of any groups yet.
          </p>
        )}
      </div>

      {/* Modal for Entering Group URL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-semibold mb-4">Enter Group URL</h2>
            <input
              type="text"
              value={groupUrl}
              onChange={(e) => setGroupUrl(e.target.value)}
              placeholder="Paste group URL here"
              className="border border-gray-300 px-4 py-2 rounded-md w-full bg-white focus:ring focus:ring-blue-300"
            />
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                onClick={handleJoinGroup}
              >
                Join
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
