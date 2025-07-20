import React from 'react'
import { Link } from 'react-router'

const HomePage = () => {
  return (
    <div className='container mx-auto flex items-center gap-[100px] h-full flex-col lg:flex-row lg:gap-0'>
       <img
        src="/orbital.png"
        alt=""
        className="absolute bottom-0 left-0 opacity-5 animate-[rotateOrbital_200s_linear_infinite] -z-10"
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <h1 className='text-8xl xl:text-6xl bg-gradient-to-r from-[#217bfe] to-[#e55571] bg-clip-text text-transparent'>प्रकोप AI</h1>
        <h2 className='text-xl font-semibold text-gray-200'>नेपाली प्राकृतिक विपद् प्रतिक्रिया च्याटबोट</h2>
        <h3 className='font-normal max-w-[70%] lg:max-w-full text-gray-400'> भूकम्प, बाढी, पहिरो जस्ता विपद्को बेला तत्काल जानकारी, सुझाव र सहयोग प्राप्त गर्नुहोस् — पूर्ण रूपमा नेपाली भाषामा।</h3>
        <Link
          to="/dashboard"
          className="mt-5 px-6 py-3 bg-[#217bfe] hover:bg-green-400 text-white hover:bg-white hover:text-black rounded-[20px] text-sm transition"
        >
          च्याटबोट प्रयोग गर्नुहोस्
        </Link>
      </div>
      <div className="right"></div>
    </div>
  )
}

export default HomePage
