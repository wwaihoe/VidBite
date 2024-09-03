"use client"

import React from 'react'
import { useState, useRef } from "react";
import ReactPlayer from 'react-player'
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { IoChatboxEllipses } from "react-icons/io5";
import { AiFillFileText } from "react-icons/ai";
import { MdHistory } from "react-icons/md";
import Summary from "./components/summary";
import Chat from "./components/chat";
import Link from 'next/link';


// control aspect ratio of video player
const tall = false
const vidDimensions = tall? {"width": 360, "height": 640}: {"width": 854, "height": 480};

const backendURL = "http://localhost:8000";

interface SectionsTimeStamps {
  timestamps: [number, number];
  text: string;
  summary_short: string;
  summary_full: string;
}

interface VideoSummary {
  summary: string;
  sections_timestamps: SectionsTimeStamps[] | null;
}


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  
  const playerRef = useRef<ReactPlayer>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];    
    if (file && file.type==='video/mp4') {
      const url = URL.createObjectURL(file as Blob);
      setFile(file);
      setFileURL(url);
    } else {
      setFileURL(undefined);
      setFile(null);
    } 
  }

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {   
    event.preventDefault();
    console.log("Submitting: " + file?.name);
    setIsLoading(true);
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    try {
      const response = await fetch(`${backendURL}/summarise`, {
        method: "POST",
        body: formData
      });
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        summaryRef.current?.scrollIntoView({behavior: "smooth"});
        setTranscript(data.sections_timestamps.map((section: SectionsTimeStamps) => section.text).join(" "));
      }  
      else {
        console.error("Request to backend failed");
        alert("Request failed!")
      }
    } catch (error) {
      console.error(error);
      alert("Request failed!");
    }
    setIsLoading(false);
  }

  const handleSeekTo = (timestamp: number) => {
    playerRef.current?.seekTo(timestamp);
  }


  return (
    <main className="flex min-h-screen flex-col place-items-center bg-gradient-to-br from-teal-500 to-rose-500 gap-3 text-base">
      <div className="flex flex-row w-full place-items-center place-content-start px-20 py-14 select-none justify-between">
        <div className="flex flex-row place-items-center gap-3">
          <SiGoogledisplayandvideo360 className="text-4xl"/>
          <Link href="/"><h1 className="text-4xl font-header font-bold text-black">VidBite</h1></Link>
        </div>
        <Link href="/history" className='place-items-center p-2 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-white/70 border-2 border-white'><MdHistory className='text-3xl text-white'/></Link>
      </div>
      <div className="w-full flex-col gap-10 place-items-center place-content-center justify-between font-sans lg:flex p-8">
        <div className="flex w-3/4 justify-center flex-row gap-10 select-none">
          <div className="basis-1/3 flex-col space-y-5 border-white border-4 p-8 rounded-2xl h-fit shadow-xl hover:shadow-2xl shadow-teal-400/50 hover:shadow-white/70">
            <h2 className="text-2xl">Upload Video</h2>
            <form className="flex-row space-y-5 w-fit" onSubmit={handleFileSubmit}>
              <input className="flex h-fit w-full rounded-md border file:bg-white file:border-0" type="file" name="file" onChange={handleFileChange}/>
              {!file ? (
                <button className="py-2 px-5 bg-teal-900 text-white font-semibold rounded-full shadow-md" disabled title="Upload a video first!">Submit</button>
              ) : !isLoading ? (
                <button className="py-2 px-5 bg-teal-500 text-white font-semibold rounded-full shadow-md hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-400 focus:ring-opacity-75">Submit</button>
              ) : (
                <button className="py-2 px-5 bg-teal-900 text-white font-semibold rounded-full shadow-md flex flex-row place-items-center gap-2" disabled>
                  <svg className="h-6 w-6 animate-spin stroke-white" viewBox="0 0 256 256">
                    <line x1="128" y1="32" x2="128" y2="64" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
                    <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="224" y1="128" x2="192" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                    <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="128" y1="224" x2="128" y2="192" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                    <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="32" y1="128" x2="64" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
                    <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                  </svg>
                    Generating summary...
                </button>
              )}         
            </form>
          </div>   
          {fileURL ? (  
            <div className="p-2.5 bg-white rounded-2xl shadow-xl hover:shadow-2xl shadow-teal-400/50 hover:shadow-white/70">
              <ReactPlayer ref={playerRef} url={fileURL} width={vidDimensions["width"]} height={vidDimensions["height"]} muted controls pip/>
            </div>
          ) : null}
        </div>
        {isLoading ? (
          <div className='flex space-x-2 justify-center items-center h-40'>
            <span className='sr-only'>Loading...</span>
            <div className='h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.3s]'></div>
            <div className='h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.15s]'></div>
            <div className='h-8 w-8 bg-white rounded-full animate-bounce'></div>
          </div>
        ) : summary ? (
          <div 
            className="flex flex-col w-3/4 space-y-3 p-8 rounded-2xl shadow-xl hover:shadow-2xl shadow-teal-400/50 hover:shadow-white/70 border-2 border-white bg-black select-none" 
            ref={summaryRef}
          >
            <div className="border-b border-gray-200 dark:border-neutral-700">
              {!showChat ? (
              <nav className="flex space-x-1" aria-label="Tabs" role="tablist">
                <button type="button" className="hs-tab-active:font-semibold hs-tab-active:border-white hs-tab-active:text-white py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-white focus:outline-none focus:text-white disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-gray-200 active" id="tabs-with-underline-item-1" data-hs-tab="#tabs-with-underline-1" aria-controls="tabs-with-underline-1" role="tab" onClick={() => setShowChat(false)}>
                  <AiFillFileText />
                  Summary
                </button>
                <button type="button" className="hs-tab-active:font-semibold hs-tab-active:border-white hs-tab-active:text-white py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-white focus:outline-none focus:text-white disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-gray-200" id="tabs-with-underline-item-2" data-hs-tab="#tabs-with-underline-2" aria-controls="tabs-with-underline-2" role="tab" onClick={() => setShowChat(true)}>
                  <IoChatboxEllipses />
                  Chat
                </button>
              </nav>
              ) : (
              <nav className="flex space-x-1" aria-label="Tabs" role="tablist">
                <button type="button" className="hs-tab-active:font-semibold hs-tab-active:border-white hs-tab-active:text-white py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-white focus:outline-none focus:text-white disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-gray-200" id="tabs-with-underline-item-1" data-hs-tab="#tabs-with-underline-1" aria-controls="tabs-with-underline-1" role="tab" onClick={() => setShowChat(false)}>
                  <AiFillFileText />
                  Summary
                </button>
                <button type="button" className="hs-tab-active:font-semibold hs-tab-active:border-white hs-tab-active:text-white py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-white focus:outline-none focus:text-white disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-gray-200 active" id="tabs-with-underline-item-2" data-hs-tab="#tabs-with-underline-2" aria-controls="tabs-with-underline-2" role="tab" onClick={() => setShowChat(true)}>
                  <IoChatboxEllipses />
                  Chat
                </button>
              </nav>
              )}
              
            </div>
            {!showChat ? (
              <Summary summary={summary} handleSeekTo={handleSeekTo}></Summary>
            ) : (
              <Chat transcript={transcript}></Chat>
            )}
            
          </div>
        ) : null}
        
      </div>
    </main>
  );
}
