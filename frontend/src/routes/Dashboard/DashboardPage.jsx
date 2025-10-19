import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = inputText;
    setInputText("");

    try {
      setLoading(true);
      setError("");
      
      const token = await getToken();
      console.log("Creating chat with text:", userMessage);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: userMessage }),
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create chat");
      }

      const data = await res.json();
      console.log("Chat created:", data);
      
      navigate(`/dashboard/chats/${data.chatId}`, { 
        state: { initialMessage: userMessage, autoRespond: true } 
      });
      
    } catch (err) {
      console.error("Error creating chat:", err);
      setError(err.message || "Failed to create chat. Please try again.");
      setInputText(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center">
      <div className="flex-1 flex flex-col items-center justify-center w-1/2 gap-12">
        <div className="flex items-center gap-5 opacity-2">
          <img src="/vite.svg" className="w-16 h-16" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#217bfe] to-[#e55571] bg-clip-text text-transparent">
            प्रकोप.AI
          </h1>
        </div>
        
        <div className="w-full flex items-center justify-between gap-12">
          <div className="flex flex-col gap-2 font-light text-sm p-5 border border-[#555] rounded-2xl flex-1">
            <img src="/chat.png" alt="" className="w-10 h-10 object-cover"/>
            <span>नयाँ च्याट</span>
          </div>
          <div className="flex flex-col gap-2 font-light text-sm p-5 border border-[#555] rounded-2xl flex-1">
            <img src="/image.png" alt="" className="w-10 h-10 object-cover"/>
            <span>जानकारी</span>
          </div>
          <div className="flex flex-col gap-2 font-light text-sm p-5 border border-[#555] rounded-2xl flex-1">
            <img src="/code.png" alt="" className="w-10 h-10 object-cover"/>
            <span>सुझाव</span>
          </div>
        </div>

        {error && (
          <div className="w-full p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}
      </div>
      
      <div className="mt-auto w-1/2 bg-[#2c2937] rounded-2xl flex">
        <form className="w-full h-full flex items-center justify-between gap-5 mb-2" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Ask" 
            className="p-5 bg-transparent flex-1 border-none outline-none placeholder-gray-400 text-[#ececec]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button 
            type="submit"
            className={`bg-[#605e68] rounded-full cursor-pointer p-3 mr-5 flex items-center justify-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <img src="/arrow.png" alt="" className="w-4 h-4"/>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
