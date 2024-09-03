# VidBite
It can be difficult to sift through long videos to get to the key points. 
Whether it is educational content, quick tips, or even just trending topics, a tool that could quickly summarize and provide important information that users are seeking would be very helpful. 
VidBite aims to save users time and enhance their content consumption experience by transforming videos into bite-sized, easily digestible and accessible summaries, sections and answers to queries.

![Screenshot 2024-09-03 231341](https://github.com/user-attachments/assets/d4f4bdf9-806d-48c4-9454-fba329ee773f)
Upload videos to summarize and gain insights to.\
![screenshot-1725376798688](https://github.com/user-attachments/assets/84da9bc3-2e55-46c8-be9d-9bf1b49f4c85)
See summary of video and skip to sections which you find interesting.\
![screenshot-1725377030953](https://github.com/user-attachments/assets/a96e2b06-9aca-45dc-9d42-1e5203999463)
Ask a chatbot questions about the video.\
![screenshot-1725380783542](https://github.com/user-attachments/assets/803f3393-8abc-4414-9c54-771be1d63b3d)
View history of generated summaries.

## What it does
VidBite is designed to streamline your video viewing experience by summarizing videos, segmenting them into easy-to-digest sections and also allowing users to ask a chatbot assistant questions about the video. 
Here’s what it offers: 
- **Summarizes Videos:** VidBite quickly analyzes the spoken content of videos and provides concise summaries that capture the essence of the video. This allows users to understand the key points without having to watch the entire clip.
- **Sections with Highlights:** It divides videos into meaningful segments, each with a brief summary, making it easy to jump to specific parts of interest. This is especially useful for longer videos or tutorials where users may only be interested in certain sections.
- **Chat:** Users can chat with a chatbot assistant to answer queries related to the video.
- **Accessibility:** VidBite makes content more accessible by providing text summaries for videos, which can be particularly beneficial for users with hearing impairments or those in environments where they can’t play audio.

## How to run
1. `git clone https://github.com/wwaihoe/vidbite`
2. `cd vidbite`
3. `docker compose up --build`

Change value of `tall` const in `frontend/app/page.tsx` to switch between tall and wide video aspect ratios.

## How it was built
Frontend:
- Next.js, React, Typescript, Tailwind CSS

Backend:
- FastAPI, Uvicorn, Python, llama.cpp (w Llama-3-8b-Instruct), whisper-timestamped 

Deployed with Docker
