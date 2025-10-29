import React, { useState } from 'react';
import { Link } from 'react-router';
import { TypeAnimation } from 'react-type-animation';

const HomePage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
    <div className="container mx-auto flex items-center gap-10 h-full flex-col lg:flex-row lg:gap-0 relative">
      {/* Background Orbital */}
      <img
        src="/orbital.png"
        alt=""
        className="absolute bottom-0 left-0 opacity-5 animate-[rotateOrbital_200s_linear_infinite] -z-10"
      />

      {/* Left Section */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-8xl xl:text-6xl sm:text-5xl bg-gradient-to-r from-[#217bfe] to-[#e55571] bg-clip-text text-transparent">
          प्रकोप AI
        </h1>
        <h2 className="text-xl font-semibold text-gray-200">
          नेपाली प्राकृतिक विपद् प्रतिक्रिया च्याटबोट
        </h2>
        <h3 className="font-normal  sm:max-w-[70%] lg:max-w-full text-gray-400">
          भूकम्प, बाढी, पहिरो जस्ता विपद्को बेला तत्काल जानकारी, सुझाव र सहयोग प्राप्त गर्नुहोस् — पूर्ण रूपमा नेपाली भाषामा।
        </h3>
        <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
  <Link
    to="/dashboard"
    className="px-6 sm:px-4 py-3 border border-[#217bfe] text-[#217bfe] hover:bg-[#217bfe] hover:text-white rounded-[20px] text-sm transition text-center"
  >
    च्याटबोट प्रयोग गर्नुहोस्
  </Link>

  <Link
    to="/explore"
    className="px-5 py-3 border border-[#217bfe] text-[#217bfe] hover:bg-[#217bfe] hover:text-white rounded-[20px] text-sm transition text-center"
  >
    अन्वेषण गर्नुहोस्
  </Link>
</div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col items-center justify-center h-full px-4">
        {/* Ambulance Container */}
        <div className="relative w-[80%] h-[50%] flex items-center justify-center bg-[#140e2d] rounded-[50px] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[50px]">
            <div className="w-[200%] h-full bg-[url('/bg.png')] bg-auto bg-repeat-y opacity-20 animate-[slideBg_8s_ease-in-out_infinite_alternate]"></div>
          </div>
          <img
            src="/Ambulance1.png"
            alt=""
            className="w-full h-full object-contain animate-[ambulanceAnimate_3s_linear_infinite_alternate]"
          />
        </div>

        {/* Chat Bubble - OUTSIDE Ambulance Box */}
        <div className="absolute mb-32 right-10 bottom-3 flex mt-1  items-center gap-2 p-2 bg-[#2c2937] rounded-lg shadow-md max-lg:hidden">
          <img
            src={
              typingStatus === "human1"
                ? "/human1.jpeg"
                : typingStatus === "human2"
                ? "/human2.jpeg"
                : "/bot.png"
            }
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
          <TypeAnimation
            sequence={[
              "User: भुकम्पमा के गर्ने?",
              2000,
              () => setTypingStatus("bot"),
              "Bot:रुख नजिक नबस्ने",
              2000,
              () => setTypingStatus("human2"),
              "User2:पहिरो कति बेला आउँछ?",
              2000,
              () => setTypingStatus("bot"),
              "Bot:धेरै पानी परे पहिरो जान स्कछ|",
              2000,
              () => setTypingStatus("human1"),
            ]}
            wrapper="span"
            repeat={Infinity}
            cursor={true}
            omitDeletionAnimation={true}
            className="text-white text-sm md:text-base"
          />
        </div>
      </div>
       <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 text-gray-500 text-xs">
        <img src="/vite.svg" alt="" className="w-4 h-4" />
        <div className="flex gap-2 sm:text-sm">
          <Link to="/">Terms of Service</Link>
          <span>|</span>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
    </div>

    
  );
};

export default HomePage;
