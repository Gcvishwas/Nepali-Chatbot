import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router";
import { useAuth } from '@clerk/clerk-react';
import NewPrompt from "../../Components/newPrompt/NewPrompt";

const ChatPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const hasAutoResponded = useRef(false);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const token = await getToken();
        console.log("Loading chat:", id);
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        console.log("Load chat response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("Loaded chat data:", data);
          
          const convertedMessages = data.history.map(item => ({
            sender: item.role === "user" ? "user" : "bot",
            text: item.parts[0].text,
            img: item.img
          }));
          
          setMessages(convertedMessages);
        } else {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to load chat");
        }
      } catch (err) {
        console.error("Error loading chat:", err);
        setError(err.message || "Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadChat();
    }
  }, [id, getToken]);

  useEffect(() => {
    if (!loading && location.state?.autoRespond && location.state?.initialMessage && !hasAutoResponded.current) {
      hasAutoResponded.current = true;
      handleNewMessage(location.state.initialMessage);
    }
  }, [loading, location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNewMessage = async (userMessage) => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.text !== userMessage) {
      setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    }
    
    setError("");

    try {
      setIsTyping(true);
      const token = await getToken();

      console.log("Sending message:", userMessage);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userMessage, 
          temperature: 0.7,
          num_return_sequences: 1
        }),
      });

      console.log("Chat response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to get response");
      }

      const data = await res.json();
      const botText = data.response;

      console.log("Bot response:", botText);

      const updateRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: userMessage,
          answer: botText
        }),
      });

      console.log("Update chat response status:", updateRes.status);

      if (!updateRes.ok) {
        console.error("Failed to save chat history");
      }

      let displayedText = "";
      for (let i = 0; i < botText.length; i++) {
        displayedText += botText[i];
        setMessages((prev) => {
          const copy = [...prev];
          if (copy[copy.length - 1]?.sender === "bot") {
            copy[copy.length - 1].text = displayedText;
          } else {
            copy.push({ sender: "bot", text: displayedText });
          }
          return copy;
        });
        await new Promise((resolve) => setTimeout(resolve, 25));
      }

      window.dispatchEvent(new CustomEvent('chatUpdated'));
      
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to get response");
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Error: ${err.message || "Failed to get response from API"}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center relative">
      <div className="flex-1 overflow-y-auto w-full flex justify-center">
        <div className="w-1/2 flex flex-col gap-5">
          {error && (
            <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${
                msg.sender === "bot"
                  ? "p-5 bg-[#3a3a3a] rounded-2xl max-w-[80%] self-start"
                  : "p-5 bg-[#2c2937] rounded-2xl max-w-[80%] self-end"
              }`}
            >
              {msg.img && <img src={msg.img} alt="" className="mb-2 rounded" />}
              {msg.text}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              जवाफ तयार गर्दै...
            </div>
          )}
          <div ref={messagesEndRef} />
          <NewPrompt onNewMessage={handleNewMessage} disabled={isTyping}/>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;