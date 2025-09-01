import { useEffect, useRef, useState } from "react"
import NewPrompt from "../../Components/newPrompt/NewPrompt"

const ChatPage = () => {
  const [messages, setMessages] = useState([]); // all messages
  const [isTyping, setIsTyping] = useState(false); // typing indicator
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNewMessage = async (userMessage) => {
    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    
      try {
      setIsTyping(true); // start typing indicator

      // Call FastAPI backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage , 
          temperature: 0.7,
          num_return_sequences: 1}),
      });

      const data = await res.json();
      const botText = data.response;

      // Gradually display bot response
      let displayedText = "";
      for (let i = 0; i < botText.length; i++) {
        displayedText += botText[i];
        setMessages((prev) => {
          const copy = [...prev];
          // Replace last bot message if exists, else push new
          if (copy[copy.length - 1]?.sender === "bot") {
            copy[copy.length - 1].text = displayedText;
          } else {
            copy.push({ sender: "bot", text: displayedText });
          }
          return copy;
        });
        await new Promise((resolve) => setTimeout(resolve, 25)); // adjust speed (ms per character)
      }
      
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Failed to get response from API" },
      ]);
    } finally {
      setIsTyping(false); // stop typing indicator
    }
  };
  return (
    <div className="h-full flex flex-col items-center relative ">
      <div className="flex-1 overflow-y-auto w-full flex justify-center">
        <div className="w-1/2 flex flex-col gap-5">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${
                msg.sender === "bot"
                  ? "p-5 bg-[#3a3a3a] rounded-2xl max-w-[80%] self-start"
                  : "p-5 bg-[#2c2937] rounded-2xl max-w-[80%] self-end"
              }`}
            >
              {msg.text}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                जवाफ तयार गर्दै...
              </div>
          )}
      <div ref={messagesEndRef} />
          <NewPrompt onNewMessage={handleNewMessage}/>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
