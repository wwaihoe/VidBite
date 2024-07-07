# VidBite
It can be difficult to sift through long videos to get to the key points. 
Whether it was educational content, quick tips, or even just trending topics, a tool that could quickly summarize and provide important information that users are seeking would be very helpful. 
This app would not only save users time but also enhance their content consumption experience by making videos more accessible and digestible.

![Screenshot 2024-07-07 181612](https://github.com/wwaihoe/vidbite/assets/91514179/3eb0b1ad-c72e-46ea-8366-9c0a9bb26827)
![Screenshot 2024-07-07 181635](https://github.com/wwaihoe/vidbite/assets/91514179/04706c56-eb2f-4dbf-9da6-fe6f38f6cb67)
![Screenshot 2024-07-07 201339](https://github.com/wwaihoe/vidbite/assets/91514179/ad31b916-4b11-4b58-8e7a-0c050af0dd96)

## What it does
VidBite is designed to streamline your video viewing experience by summarizing videos, segmenting them into easy-to-digest sections and also allowing users to ask a chatbot assistant questions about the video. 
Here’s what it offers: 
- Summarizes Videos: VidBite quickly analyzes the spoken content of videos and provides concise summaries that capture the essence of the video. This allows users to understand the key points without having to watch the entire clip.
- Sections with Highlights: It divides videos into meaningful segments, each with a brief summary, making it easy to jump to specific parts of interest. This is especially useful for longer videos or tutorials where users may only be interested in certain sections.
- Chat: Users can chat with a chatbot assistant to answer queries related to the video.
- Accessibility: VidBite makes content more accessible by providing text summaries for videos, which can be particularly beneficial for users with hearing impairments or those in environments where they can’t play audio.

## How to run
1. `git clone https://github.com/wwaihoe/vidbite`
2. `cd vidbite`
3. `docker compose up --build`

## How it was built
Frontend:
- Next.js, React, Typescript, Tailwind CSS

Backend:
- FastAPI, Uvicorn, Python, llama.cpp (w Llama-3-8b-Instruct), whisper-timestamped 

Deployed with Docker
