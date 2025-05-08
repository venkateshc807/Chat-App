import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const RightSidebar = () => {
  const { selectedUser, messages, onlineUsers } = useContext(ChatContext);
  const { logout } = useContext(AuthContext);
  const [msgImages, setMessageImages] = useState([]);

  useEffect(() => {
    const imagesOnly = messages.filter(msg => msg.image).map(msg => msg.image);
    setMessageImages(imagesOnly);
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? 'max-md:hidden' : ''}`}>
      {/* User Info */}
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img className="w-20 aspect-[1/1] rounded-full" src={selectedUser?.profilePic || assets.avatar_icon} alt={`${selectedUser.fullName}'s profile`} />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          {selectedUser.fullName}
        </h1>
        <p className="px-10 text-center">{selectedUser.bio || 'No bio available.'}</p>
      </div>

      <hr className="border-[#ffffff50] my-4" />

      {/* Media Gallery */}
      <div className="px-5 text-xs">
        <p className="font-medium mb-2">Media</p>
        {msgImages.length > 0 ? (
          <div className="max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {msgImages.map((url, index) => (
              <div key={index} onClick={() => window.open(url)} className="cursor-pointer rounded">
                <img src={url} alt={`Chat image ${index + 1}`} className="h-full rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400 text-center mt-5">No media shared yet.</p>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
