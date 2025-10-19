import React, { useRef, useState } from 'react';

const NewPrompt = ({ onNewMessage, disabled }) => {
  const endRef = useRef(null);
  const [text, setText] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return; 
    
    onNewMessage(text);
    setText("");
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
          disabled={disabled}
        />
        <button
          type="submit"
          className={`rounded-full bg-[#605e68] border-none p-2 flex items-center justify-center cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={disabled}
        >
          {disabled ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <img src="/arrow.png" alt="send" className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default NewPrompt;