import React from 'react'
import { Link } from 'react-router'

const ChatList = () => {
  return (
    <div className="flex flex-col h-full">
        <span className="title font-semibold text-[10px] mb-2.5">DASHBOARD</span>
  <Link
    to="/dashboard"
    className="p-2.5 rounded-[10px] hover:bg-[#2c2937]"
  >
    Create a new Chat
  </Link>
      <Link to="/"  className="p-2.5 rounded-[10px] hover:bg-[#2c2937]">Explore</Link>
      <Link to="/"  className="p-2.5 rounded-[10px] hover:bg-[#2c2937]">Contact</Link>
<hr className="border-none h-[2px] bg-[#ddd] opacity-10 rounded-[5px] my-5" />
<span className="title font-semibold text-[10px] mb-2.5">RECENT CHATS</span>
      <div className="list flex flex-col overflow-y-auto scrollbar-hide">
        <Link to="/" className='rounded-[10px] p-1.5 hover:bg-[#2c2937]'>My chat list</Link>
        <Link to="/" className='rounded-[10px]  p-1.5 hover:bg-[#2c2937]'>My chat list</Link>
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
  )
} 

export default ChatList;
