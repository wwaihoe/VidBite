"use client";

import React from 'react'
import { useState, useEffect } from "react";
import Link from 'next/link';
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { MdHistory } from "react-icons/md";
import HistorySummary from "./../../components/historySummary";


const backendURL = "http://localhost:8000";

interface Summary {
  id: number;
  title: string;
  summary: string;
}

interface Section {
  id: number
  summary_id: number
  title: string
  start_timestamp: number
  end_timestamp: number
  text: string
  summary_short: string;
  summary_full: string;
}
    
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


export default function Page({ params }: { params: { summary_id: number } }) {
  const [title, setTitle] = useState<string>("");
  const [videoSummary, setVideoSummary] = useState<VideoSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getSummary = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendURL}/summary/${params.summary_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        } else {
          const responseJSON = await response.json();
          const summary = responseJSON.summary as Summary;
          setTitle(summary.title);
          return summary;
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const getSections = async () => {
      try {
        const response = await fetch(`${backendURL}/sections/${params.summary_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch sections");
        } else {
          const responseJSON = await response.json();
          const sections = responseJSON.sections as Section[];
          const sections_timestamps = sections.map((section) => {
            return {
              timestamps: [section.start_timestamp, section.end_timestamp] as [number, number],
              text: section.text,
              summary_short: section.summary_short,
              summary_full: section.summary_full,
            };
          });
          return sections_timestamps;
          
        }
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    };

    const getVideoSummary = async () => {
      const summary = await getSummary();    
      if (summary) {
        const sections_timestamps = await getSections();
        if (sections_timestamps) {
          setVideoSummary({ summary: summary.summary, sections_timestamps:  sections_timestamps}); 
        }
      }
    }

    getVideoSummary();
    
  }, []);

  return (
    <main className="flex min-h-screen flex-col place-items-center bg-gradient-to-br from-teal-500 to-rose-500 gap-3 text-base">
      <div className="flex flex-row w-full place-items-center place-content-start px-20 py-14 select-none justify-between">
        <Link href="/" className="flex flex-row place-items-center gap-3">
          <SiGoogledisplayandvideo360 className="text-4xl"/>
          <h1 className="text-4xl font-header font-bold text-black">VidBite</h1>
        </Link>
        <Link href="/history" className='place-items-center p-2 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-white/70 border-2 border-white'><MdHistory className='text-3xl text-white'/></Link>
      </div>
      <div className="w-full flex-col gap-10 place-items-center place-content-center justify-between font-sans lg:flex p-8">
      {isLoading ? (
        <div className='flex space-x-2 justify-center items-center h-40'>
          <span className='sr-only'>Loading...</span>
          <div className='h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.3s]'></div>
          <div className='h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.15s]'></div>
          <div className='h-8 w-8 bg-white rounded-full animate-bounce'></div>
        </div>
      ) : videoSummary ? (
        <div className="flex flex-col w-3/4 space-y-3 p-8 rounded-2xl shadow-xl hover:shadow-2xl shadow-teal-400/50 hover:shadow-white/70 border-2 border-white bg-black select-none">
          <h2 className='text-3xl'>{title}</h2>
          <HistorySummary summary={videoSummary?.summary} sections_timestamps={videoSummary?.sections_timestamps}></HistorySummary>
        </div>
      )
      : null}
      </div>
    </main>
  );
}