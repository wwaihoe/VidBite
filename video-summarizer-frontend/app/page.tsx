"use client"

import React from 'react'
import { useState, useRef } from "react";
import ReactPlayer from 'react-player'
import { SiGoogledisplayandvideo360 } from "react-icons/si";


const tall = true;
const backendURL = "http://localhost:8000";
const vidDimensions = tall? {"width": 360, "height": 640}: {"width": 854, "height": 480} ;

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
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const playerRef = useRef<ReactPlayer>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const testfunction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSummary({summary: "This is a summary", sections_timestamps: [{timestamps: [0, 10], text: "This is a section", summary_short: "Topic", summary_full: "This is a summary"}, {timestamps: [10, 20], text: "This is a section", summary_short: "Topic", summary_full: "This is a summary"}, {timestamps: [20, 30], text: "This is a section", summary_short: "Topic", summary_full: "This is a summary"}]});
  }
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
      }  
      else {
        console.error("Request to backend failed");
        alert("Request failed!")
      }
    } catch (error) {
      console.error(error);
      alert("Request failed!")
    }
    setIsLoading(false);
  }

  const handleToggleShowTranscript = () => {
    setShowTranscript(!showTranscript);
  }

  const handleSeekTo = (timestamp: number) => {
    playerRef.current?.seekTo(timestamp);
  }

  const convertSecondsToMinutesAndSeconds = (totalSeconds: number): string => {
    // Ensure totalSeconds is an integer
    totalSeconds = Math.floor(totalSeconds);
  
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    // Pad seconds with leading zero if less than 10
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return `${minutes}:${formattedSeconds}`;
  };

  return (
    <main className="flex min-h-screen flex-col place-items-center bg-gradient-to-br from-teal-500 to-rose-500 gap-3 text-base">
      <div className="flex flex-row w-full place-items-center place-content-start px-20 py-14 gap-3 select-none">
        <SiGoogledisplayandvideo360 className="text-4xl"/>
        <h1 className="text-4xl font-header font-bold text-black">VidBite</h1>
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
            <h2 className="text-xl text-white">Summary</h2>
            <p className="text-white select-text">{summary.summary}</p>
            {summary.sections_timestamps ? (
              <div className="space-y-3">
                <div className="flex flex-row items-center gap-4 pt-3">
                  <h2 className="text-xl text-white">Sections</h2>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      onClick={handleToggleShowTranscript} 
                      type="checkbox" 
                      className="sr-only peer" 
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 dark:bg-gray-700 peer-checked:bg-teal-400">
                      <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full border border-gray-300 dark:border-gray-600 transition-transform peer-checked:translate-x-full rtl:peer-checked:translate-x-0 peer-checked:border-white"></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-white">Show Transcript</span>
                  </label>
                </div>           
                <table className="w-full table-auto border-separate border-spacing-2 border-2 border-rose-600 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-lg border-2 border-teal-500 rounded-lg">Time</th>
                      <th className="px-2 py-2 text-lg border-2 border-teal-500 rounded-lg">Section</th>
                      <th className="px-2 py-2 text-lg border-2 border-teal-500 rounded-lg">
                        {showTranscript ? 'Transcript' : 'Summary'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.sections_timestamps.map((section_timestamp, index) => (
                      <tr key={index}>
                        <td className="px-2 py-2 flex border-2 border-teal-500 rounded-lg">
                          <span className="hover:text-rose-600 cursor-pointer" onClick={() => handleSeekTo(section_timestamp.timestamps[0])}>
                            {convertSecondsToMinutesAndSeconds(section_timestamp.timestamps[0])}
                          </span>
                          -
                          <span className="hover:text-rose-600 cursor-pointer" onClick={() => handleSeekTo(section_timestamp.timestamps[1])}>
                            {convertSecondsToMinutesAndSeconds(section_timestamp.timestamps[1])}
                          </span>
                        </td>
                        <td className="px-2 py-2 border-2 border-teal-500 rounded-lg content-start select-text">{section_timestamp.summary_short}</td>
                        <td className="px-2 py-2 border-2 border-teal-500 rounded-lg content-start select-text">
                          {showTranscript ? section_timestamp.text : section_timestamp.summary_full}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-white">Failed to generate sections</p>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
