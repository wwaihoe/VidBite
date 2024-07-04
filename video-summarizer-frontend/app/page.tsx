"use client"
const backendURL = "http://localhost:8000";
import { useState, useEffect } from "react";

export default function Home() {
  const [fileURL, setFileURL] = useState<string | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const url = URL.createObjectURL(file as Blob);
    if (file && file.type==='video/mp4') {
      setFileURL(url);
    } else {
      setFileURL(undefined);
    } 
  }

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {   
    event.preventDefault();
    console.log("submitting");
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
        setFileURL(data.url);
      }  
      else {
        console.error("Request to backend failed");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="flex space-y-9 min-h-screen flex-col items-center p-24">
      <div>
        <h1 className="text-3xl">Video Summarizer</h1>
      </div>
      <div className="w-full flex-col space-y-6 max-w-5xl items-center justify-between font-sans lg:flex">
        <div className="flex-col space-y-3">
          <form onSubmit={handleFileSubmit}>
            <h2>Upload Video</h2>
            <input type="file" name="file" onChange={handleFileChange}/>
            <button>Submit</button>
          </form>
        </div>
        <div>
          <video width="1280" height="960" src={fileURL} video-type="video/mp4" muted controls preload="auto"/>
        </div>
        
      </div>
    </main>
  );
}
