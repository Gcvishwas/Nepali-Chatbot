const DashboardPage = () => {
  return (
   <div className="h-full flex flex-col items-center">
    <div className="flex-1 flex flex-col items-center justify-center w-1/2 gap-12">
      <div className="flex items-center gap-5 opacity-2">
        {/* Logo */}
        <img src="/vite.svg" className="w-16 h-16" />
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#217bfe] to-[#e55571] bg-clip-text text-transparent">प्रकोप.AI</h1>
      </div>
      {/* Options */}
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
    </div>
    {/* Input form */}
    <div className="mt-auto w-1/2 bg-[#2c2937] rounded-2xl flex">
      <form className="w-full h-full flex items-center justify-between gap-5 mb-2">
        {/* input */}
        <input type="text" placeholder="Ask" className="p-5 bg-transparent flex-1 border-none outline-none placeholder-gray-400 text-[#ececec]"/>
        <button className="bg-[#605e68] rounded-full cursor-pointer p-3 mr-5 flex items-center justify-center">
          <img src="/arrow.png" alt="" className="w-4 h-4"/>
        </button>
      </form>
    </div>
   </div>
  )
}

export default DashboardPage
