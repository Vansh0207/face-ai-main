import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function HomePage() {
  const { user } = useSelector((store) => store.auth);
  const createdGroups = user?.createdGroups || [];
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center p-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">
        Your Folders
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl">
        {/* Navigate to Upload Page */}
        <button
          className="w-32 h-32 bg-[#2A3B5F] hover:bg-[#1C2A47] text-white flex flex-col items-center justify-center rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          onClick={() => navigate("/upload-image")}
        >
          <FaPlus className="text-4xl" />
          <span className="mt-2 text-sm font-semibold">New Folder</span>
        </button>

        {/* User Created Groups */}
        {createdGroups.length > 0 ? (
          createdGroups.map((group, index) => (
            <div
              key={index}
              className="w-32 h-32 bg-white flex items-center justify-center rounded-xl shadow-md text-gray-800 font-semibold text-lg cursor-pointer border border-gray-300 hover:shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {group}
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-lg col-span-full mt-6 text-center">
            🚀 You haven't created any groups yet. Start organizing now!
          </p>
        )}
      </div>
    </div>
  );
}
