import React from 'react'
import { useState } from "react";

const backendURL = "http://localhost:8000";


interface ChatProps {
  transcript: string;
}

export default function Chat(props: ChatProps) {
  const [query, setQuery] = useState<string>("");
  const [prevQuery, setPrevQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatResponse, setChatResponse] = useState<string>("");

  const handleChatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }

  const testFunction = () => {
    setChatResponse("This is a test response");
  }

  const handleChatSubmit = async() => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendURL}/chat`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "query": query, "transcript": props.transcript })
      });
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        const responseStr = await data["response"];
        setPrevQuery(query);
        setChatResponse(responseStr);
      }  
      else {
        console.error("Request to backend failed");
        alert("Request failed!");
      }
    } catch (error) {
      console.error(error);
      alert("Request failed!");
    }
    setQuery("");
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col gap-3 content-start">
      <h2 className="text-xl text-white">Chat</h2>
      <label>Query: </label>
      {!isLoading ? (
        <input className="px-2 border-2 border-white rounded text-black placeholder:text-black" required type="text" id="query" name="query" value={query} onChange={handleChatChange}/>
      ) : (
        <input className="px-2 border-2 border-white rounded text-black placeholder:text-black" disabled type="text" id="query" name="query" value={query} onChange={handleChatChange}/>
      )}
      {query === ""? (
        <button className="my-2 w-fit py-2 px-5 bg-teal-900 text-white font-semibold rounded-full shadow-md" disabled title="Input a query first!">Submit</button>
      ) : !isLoading ? (
        <button className="my-2 w-fit py-2 px-5 bg-teal-500 text-white font-semibold rounded-full shadow-md hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-400 focus:ring-opacity-75" onClick={handleChatSubmit}>Submit</button>
      ) : (
        <button className="w-fit py-2 px-5 bg-teal-900 text-white font-semibold rounded-full shadow-md flex flex-row place-items-center gap-2" disabled>
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
            Generating response...
        </button>
      )}         
      {(chatResponse !== "")? (
        <div className="mt-2 p-2 border-2 border-rose-600 rounded-2xl bg-black">
          <h2 className="text-xl text-white">Query</h2>
          <p className="text-white select-text mt-1">{prevQuery}</p>
          <h2 className="mt-1 text-xl text-white">Response</h2>
          <p className="text-white select-text mt-1">{chatResponse}</p>
        </div>
      ) : null}
    </div>
  )
}