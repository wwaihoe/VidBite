import React, { use } from 'react'
import { useState, useEffect } from "react";


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


export default function HistorySummary(props: VideoSummary) {
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

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
    <div>
      <h2 className="text-xl text-white">Summary</h2>
      <p className="text-white select-text">{props.summary}</p>
      {props.sections_timestamps ? (
        <div className="space-y-3">
          <div className="flex flex-row items-center gap-4 pt-3">
            <h2 className="text-xl text-white">Sections</h2>
            <label className="inline-flex items-center cursor-pointer">
              <input 
                onClick={() => setShowTranscript(!showTranscript)} 
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
              {props.sections_timestamps.map((section_timestamp, index) => (
                <tr key={index}>
                  <td className="px-2 py-2 flex border-2 border-teal-500 rounded-lg">
                    <span>
                      {convertSecondsToMinutesAndSeconds(section_timestamp.timestamps[0])}
                    </span>
                    -
                    <span>
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
  )
}
