import React, { useEffect, useRef, useState } from 'react';

const NewPrompt = ({ onNewMessage }) => {
  const endRef = useRef(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return; 
    setLoading(true);
    onNewMessage(text); // Pass message to parent
    setText("");
    setLoading(false);
  };

  return (
    <div className="pb-[100px]" ref={endRef}>
      <form
        className="w-1/2 absolute bottom-0 bg-[#2c2937] rounded-2xl flex items-center px-4"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          className="flex-1 p-4 border-none outline-none bg-transparent text-[#ececec]"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className={`rounded-full bg-[#605e68] border-none p-2 flex items-center justify-center cursor-pointer ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <img src="/arrow.png" alt="send" className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default NewPrompt;
