import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useAuth } from '@clerk/clerk-react';

const ChatList = () => {
  const { id: currentChatId } = useParams();
  const { getToken } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete chat function
  const handleDeleteChat = async (chatId) => {
    const confirmed = window.confirm("Are you sure you want to delete this chat?");
    if (!confirmed) return;

    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        window.dispatchEvent(new Event('chatUpdated')); // to refresh other components
      } else {
        console.error("Failed to delete chat");
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  useEffect(() => {
    fetchChats();
    const handleChatUpdate = () => fetchChats();
    window.addEventListener('chatUpdated', handleChatUpdate);
    return () => window.removeEventListener('chatUpdated', handleChatUpdate);
  }, [getToken]);

  useEffect(() => {
    if (currentChatId) fetchChats();
  }, [currentChatId]);

  return (
    <div className="flex flex-col h-full">
      <span className="title font-semibold text-[10px] mb-2.5">DASHBOARD</span>
      <Link to="/dashboard" className="p-2.5 rounded-[10px] hover:bg-[#2c2937]">Create a new Chat</Link>
      <Link to="/explore" className="p-2.5 rounded-[10px] hover:bg-[#2c2937]">Explore</Link>
      <Link to="/emergency" className="p-2.5 rounded-[10px] hover:bg-[#2c2937]">Emergency Contacts</Link>

      <hr className="border-none h-[2px] bg-[#ddd] opacity-10 rounded-[5px] my-5" />
      
      <span className="title font-semibold text-[10px] mb-2.5">RECENT CHATS</span>
      <div className="list flex flex-col overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="p-2">Loading...</div>
        ) : chats.length === 0 ? (
          <div className="p-2 text-[#888]">No chats yet</div>
        ) : (
          chats.slice().reverse().map((chat) => (
            <div
              key={chat._id}
              className={`flex justify-between items-center rounded-[10px] p-1.5 hover:bg-[#2c2937] ${
                currentChatId === chat._id ? 'bg-[#2c2937]' : ''
              }`}
            >
              <Link to={`/dashboard/chats/${chat._id}`} className="truncate flex-1">
                {chat.title}
              </Link>
              {/* ✅ Delete button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteChat(chat._id);
                }}
                className="text-[#888] hover:text-red-400 ml-2 text-xs"
                title="Delete chat"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <hr className="border-none h-[2px] bg-[#ddd] opacity-10 rounded-[5px] my-5" />

      <div className="upgrade mt-auto flex items-center gap-2 text-[12px]">
        <img src="/vite.svg" alt="logo" className="w-6 h-6" />
        <div className="texts flex flex-col">
          <span className="font-semibold">Upgrade </span>
          <span className="text-[#888]">New Features coming soon!!!</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
