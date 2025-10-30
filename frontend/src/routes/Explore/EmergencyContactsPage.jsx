import React, { useEffect, useState } from 'react'
import { Phone, MapPin, Search } from 'lucide-react';

const EmergencyContactsPage = () => {
const[loading, setLoading]=useState(true);
const[error, setError]=useState(null);
const[contacts, setContacts]=useState([]);
const[searchQuery, setSearchQuery]=useState('');
const[filteredContacts, setFilteredContacts]=useState([]);

// Fetching contacts
useEffect(()=>{
  const fetchContacts = async()=>{
    try{
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contacts`)
      if(!response.ok){
        throw new Error("API request failed");
      }
      const data = await response.json();
      setContacts(data);
    }catch(err){
      console.log(err);
      setError("डेटा लोड गर्न असफल भयो");
    }finally{
      setLoading(false);
    }
  };
  fetchContacts();
},[])



// Filtering Contacts

useEffect(()=>{
  if(!searchQuery){
    setFilteredContacts(contacts)
  }else{
    const query=searchQuery.toLowerCase();
    const filtered=contacts.filter((c)=>
    c.name?.toLowerCase().includes(query)||
    c.address?.toLowerCase().includes(query)||
    c.type?.toLowerCase().includes(query)
  );
  setFilteredContacts(filtered);
  }
},[searchQuery,contacts])

// Loading Screen

if(loading){
  return<div className='min-h-screen flex items-center justify-center bg-slate-900'>
    <div className='text-center text-white'>
    <div className='animate-spin w-16 border-blue-400 border-t-4 border-solid rounded-full h-16 mx-auto mb-2'></div>
    <p>लोड हुँदैछ...</p>
    </div>
  </div>
}

if(error){
  return <div className='min-h-screen flex justify-center items-center bg-slate-900 text-red-500'>
    <p>{error}</p>
  </div>
}


  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-8'>
      {/* Heading */}
      <h1 className='text-2xl sm:text-3xl font-bold text-white mb-6 p-1'>आकस्मिक सम्पर्कहरू</h1>

    {/* Search Bar */}

    <div className='mb-6'>
      <div className='relative'>
        <input
        type='text'
        placeholder="नाम, ठेगाना वा सेवा प्रकार खोज्नुहोस्..."
        value={searchQuery}
        onChange={(e)=> setSearchQuery(e.target.value)}
        className='w-full bg-slate-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 '
        />
        <Search className='absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'/>
      </div>
    </div>


      {/* Contact List */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Contact cards */}
{filteredContacts.length===0?(
  // col-span-full text-center text-gray-400 py-10
  <div className='col-span-full text-center text-gray-400 py-10'>
    कुनै सम्पर्क फेला परेन
  </div>
): filteredContacts.map((contact,index)=>(    
        <div 
        key={index}
        className='bg-white bg-opacity-10 rounded-xl p-4 border-white border border-opacity-10 hover:scale-105 transform transition backdrop-blur-md'>

          {/* Contact Name */}
        <h1 className='text-lg font-semibold text-white mb-2 truncate'>{contact.name}</h1>

        {/* Contact Address */}
        {contact.address && (

          <div className='flex items-center text-gray-300 text-sm mb-1'>
          <MapPin className='w-4 h-4 mr-1'/><span>{contact.address}</span>
          </div>
        )}

          {/* Contact Number */}
          {contact.number && (

          <div className='flex items-center text-gray-300 text-sm mb-1'>
          <Phone className='w-4 h-4 mr-1'/><a href={`tel:${contact.number}`} className='hover:underline'>{contact.number}</a>
          </div>
        )}
        </div>
          ))}
      </div>
    </div>
  )
}

export default EmergencyContactsPage
