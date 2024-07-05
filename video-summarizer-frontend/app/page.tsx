"use client"
const backendURL = "http://localhost:8000";
import { useState, useEffect, use } from "react";
import { SiGoogledisplayandvideo360 } from "react-icons/si";

interface SectionsTimeStamps {
  timestamps: [number, number];
  text: string;
  summary: string;
}

interface VideoSummary {
  summary: string;
  sections_timestamps: SectionsTimeStamps[];
}


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const testfunction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSummary({summary: "This is a summary", sections_timestamps: [{timestamps: [0, 10], text: "This is a section", summary: "This is a summary"}, {timestamps: [10, 20], text: "This is a section", summary: "This is a summary"}, {timestamps: [20, 30], text: "This is a section", summary: "This is a summary"}]});
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
    console.log(formData);
    try {
      const response = await fetch(`${backendURL}/summarise`, {
        method: "POST",
        body: formData
      });
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }  
      else {
        console.error("Request to backend failed");
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }

  const handleToggleShowTranscript = () => {
    setShowTranscript(!showTranscript);
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
        <SiGoogledisplayandvideo360 className="text-5xl"/>
        <h1 className="text-4xl font-header font-bold text-black">Video Summarizer</h1>
      </div>
      <div className="w-full flex-col gap-10 place-items-center place-content-center justify-between font-sans lg:flex p-8">
        <div className="flex w-3/4 flex-row gap-10 select-none">
          <div className="basis-1/3 flex-col space-y-5 border-white border-4 p-8 rounded-2xl h-fit shadow-xl hover:shadow-2xl shadow-teal-400/50 hover:shadow-white/70">
            <h2 className="text-2xl">Upload Video</h2>
            <form className="flex-row space-y-5 w-fit" onSubmit={handleFileSubmit}>
              <input className="flex h-fit w-full rounded-md border file:bg-white file:border-0" type="file" name="file" onChange={handleFileChange}/>
              {!file ? (
                <button className="py-2 px-5 bg-teal-900 text-white font-semibold rounded-full shadow-md" disabled title="Upload a video first!">Submit</button>
              ) : !isLoading ? (
                <button className="py-2 px-5 bg-teal-500 text-white font-semibold rounded-full shadow-md hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-400 focus:ring-opacity-75">Submit</button>
                
              ) : (
                <button className="py-2 px-5 bg-teal-900 text-white font-semibold rounded-full shadow-md" disabled>Generating summary...</button>
              )}         
            </form>
          </div>        
          <div className="basis-2/3 p-4 bg-white rounded-2xl shadow-xl hover:shadow-2xl shadow-teal-400/50 hover:shadow-white/70">
            <video width="1280" height="960" src={fileURL} video-type="video/mp4" muted controls preload="auto"/>
          </div>
        </div>
        {summary ? (
          <div className="flex-col w-3/4 content-start items-start place-content-stretch space-y-3 p-8 rounded-2xl shadow-xl hover:shadow-2xl shadow-teal-400/50 hover:shadow-white/70 border-white border-2 bg-black select-text">
            <h2 className="text-xl text-white">Summary</h2>
            <p className="text-white">{summary.summary}</p>
            <div className="flex flex-row content-start align-middle gap-4 pt-3">
              <h2 className="text-xl text-white">Sections</h2>
              <label className="inline-flex items-center cursor-pointer">
                <input onClick={handleToggleShowTranscript} type="checkbox" value="" className="sr-only peer"/>
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-400"></div>
                <span className="ms-2 text-sm font-medium">Show transcript</span>
              </label>
            </div>           
            <table className="table-auto border-separate w-full border-spacing-2 border-2 border-rose-600 rounded-lg">
              <thead>
                <tr>
                  <th className="border-2 border-teal-500 px-2 py-2 text-lg rounded-lg">Time</th>
                  <th className="border-2 border-teal-500 px-2 py-2 text-lg rounded-lg">Section</th>
                  {showTranscript ?
                    <th className="border-2 border-teal-500 px-2 py-2 text-lg rounded-lg">Transcript</th>
                  : null}
                </tr>
              </thead>
              <tbody>
                {summary.sections_timestamps.map((section_timestamp, index) => (
                  <tr key={index}>
                    <td className="border-2 border-teal-500 px-2 py-2 rounded-lg">
                      {`${convertSecondsToMinutesAndSeconds(section_timestamp.timestamps[0])} - ${convertSecondsToMinutesAndSeconds(section_timestamp.timestamps[1])}`}
                    </td>
                    <td className="border-2 border-teal-500 px-2 py-2 rounded-lg">{section_timestamp.summary}</td>
                    {showTranscript ?
                      <td className="border-2 border-teal-500 px-2 py-2 rounded-lg">{section_timestamp.text}</td>
                    : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </main>
  );
}
