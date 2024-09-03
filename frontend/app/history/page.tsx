"use client"

import React from 'react'
import { useState, useEffect } from "react";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { MdHistory } from "react-icons/md";
import Summary from "./../components/summary";
import Link from 'next/link';


const backendURL = "http://localhost:8000";

interface Summary {
  id: number;
  title: string;
  summary: string;
}


export default function Home() {
  const [summaries, setSummaries] = useState<Summary[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getSummaries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendURL}/history`);
        if (!response.ok) {
          throw new Error("Failed to fetch summaries");
        }
        else {
          const responseJSON = await response.json();
          const summaries = responseJSON.summaries as Summary[];
          setSummaries(summaries);
          }
      } catch (error) {
        console.error("Error:", error);
      }
      setIsLoading(false);
    }
    getSummaries();    
  }, []);

  return (
    <main className="flex min-h-screen flex-col place-items-center bg-gradient-to-br from-teal-500 to-rose-500 gap-3 text-base">
      <div className="flex flex-row w-full place-items-center place-content-start px-20 py-14 select-none justify-between">
        <div className="flex flex-row place-items-center gap-3">
          <SiGoogledisplayandvideo360 className="text-4xl"/>
          <Link href="/"><h1 className="text-4xl font-header font-bold text-black">VidBite</h1></Link>
        </div>
        <Link href="/history" className='place-items-center p-2 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-white/70 border-2 border-white'><MdHistory className='text-3xl text-white'/></Link>
      </div>
      <div className="w-8/12 flex-col gap-5 place-items-center place-content-center justify-between font-sans lg:flex p-8 overflow-y-auto">
        {isLoading ? (
          <div className='flex space-x-2 justify-center items-center h-40'>
            <span className='sr-only'>Loading...</span>
            <div className='h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.3s]'></div>
            <div className='h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.15s]'></div>
            <div className='h-8 w-8 bg-white rounded-full animate-bounce'></div>
          </div>
        ) : summaries ? (
          summaries.map((summary) => (
            <div key={summary.id} className='p-10 text-lg bg-black border-2 border-white rounded-lg'>
              <h2 className='text-2xl mb-3'>{summary.title}</h2>
              <p>{summary.summary}</p>
              <Link href={`/history/${summary.id}`}>
                <button className='mt-3 py-2 px-5 bg-teal-500 text-white font-semibold rounded-full shadow-md hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-400 focus:ring-opacity-75'>View Summary</button>
              </Link>
            </div>
          ))
        )
        : <h2 className='text-4xl select-none'>No summaries generated yet</h2>}
      </div>
    </main>
  );
}
