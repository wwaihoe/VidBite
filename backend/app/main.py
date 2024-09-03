import uvicorn
from fastapi import FastAPI, File, UploadFile, Form
from pipeline import video_summarizer
from chat import chat_model
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import os
from pathlib import Path

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to the PostgreSQL database
conn = psycopg2.connect(dbname="video_summaries", user="postgres", password="admin", host="db", port="5432")
cur = conn.cursor()

# Create the tables if they don't exist
cur.execute("""CREATE TABLE IF NOT EXISTS summaries (
            id SERIAL PRIMARY KEY, 
            title TEXT, 
            summary TEXT)""")
cur.execute("""CREATE TABLE IF NOT EXISTS sections (
            id SERIAL PRIMARY KEY, 
            summary_id INTEGER REFERENCES summaries(id), 
            title TEXT, 
            start_timestamp INTEGER, 
            end_timestamp INTEGER, 
            text TEXT, 
            summary_short TEXT,
            summary_full TEXT)""")
conn.commit()
cur.close()


@app.get("/")
def root():
    return {"message": "Server online"}


class SectionsTimeStamps(BaseModel):
    timestamps: tuple[int, int]
    text: str
    summary_short: str
    summary_full: str

class SummaryResponse(BaseModel):
    summary: str
    sections_timestamps: list[SectionsTimeStamps] | None

class ChatRequest(BaseModel):
    query: str
    transcript: str

class SummaryRequest(BaseModel):
    summary_id: int

class SectionsRequest(BaseModel):
    summary_id: int

class Summary(BaseModel):
    id: int
    title: str
    summary: str

class Section(BaseModel):
    id: int
    summary_id: int
    title: str
    start_timestamp: int
    end_timestamp: int
    text: str
    summary_short: str
    summary_full: str


@app.post("/summarise")
def summarise(file: UploadFile = File(...), response_model=SummaryResponse):
    try:
        Path("./public/uploads").mkdir(parents=True, exist_ok=True)
        file_path = f"./public/uploads/{file.filename}"
        with open(file_path, "wb+") as file_object:
            file_object.write(file.file.read())
        result = video_summarizer.summarize(file_path)
        os.remove(file_path)
    except Exception as e:
        print(e)
    if result["sections_timestamps"] is None:
        print("Failed to generate sections")
    else:
        try:
            cur = conn.cursor()
            print("filename: " + file.filename)
            print("summary: " + result["summary"])
            cur.execute("INSERT INTO summaries (title, summary) VALUES (%s, %s) RETURNING id", (file.filename, result["summary"]))
            summary_id = cur.fetchone()[0]
            for section in result["sections_timestamps"]:
                cur.execute("INSERT INTO sections (summary_id, title, start_timestamp, end_timestamp, text, summary_short, summary_full) VALUES (%s, %s, %s, %s, %s, %s, %s)", (summary_id, file.filename, section["timestamps"][0], section["timestamps"][1], section["text"], section["summary_short"], section["summary_full"]))
            conn.commit()
        except Exception as e:
            print("Failed to insert into database")
            print(e) 
        finally:
            cur.close()
    print("Summary complete")
    return result

@app.post("/upload")
def upload_file(file: UploadFile):
    Path("./public/uploads").mkdir(parents=True, exist_ok=True)
    file_path = f"./public/uploads/{file.filename}"    
    with open(file_path, "wb+") as file_object:
        file_object.write(file.file.read())
    return {"message": "Uploaded file: " + file.filename}

@app.post("/chat")
def chat(request: ChatRequest):
    result = chat_model.generate(request.query, request.transcript)
    return {"response": result}

@app.get("/history")
def get_summaries():
    cur = conn.cursor()
    cur.execute("SELECT * FROM summaries")
    result = cur.fetchall()
    cur.close()
    summaries = []
    for summary in result:
        summaries.append({"id": summary[0], "title": summary[1], "summary": summary[2]}) 
    return {"summaries": summaries}

@app.post("/summary")
def get_summary(request: SummaryRequest):
    cur = conn.cursor()
    cur.execute("SELECT * FROM summaries WHERE id = %s", (request.summary_id,))
    result = cur.fetchone()
    cur.close()
    summary = {"id": result[0], "title": result[1], "summary": result[2]}
    return {"summary": summary}

@app.post("/sections")
def get_sections(request: SectionsRequest):
    cur = conn.cursor()
    cur.execute("SELECT * FROM sections WHERE summary_id = %s", (request.summary_id,))
    result = cur.fetchall()
    cur.close()
    sections = []
    for section in result:
        sections.append({"id": section[0], "summary_id": section[1], "title": section[2], "start_timestamp": section[3], "end_timestamp": section[4], "text": section[5], "summary_short": section[6], "summary_full": section[7]})
    return {"sections": sections}

@app.post("/delete")
def delete_summary(request: SummaryRequest):
    cur = conn.cursor()
    cur.execute("DELETE FROM summaries WHERE id = %s", (request.summary_id,))
    cur.execute("DELETE FROM sections WHERE summary_id = %s", (request.summary_id,))
    conn.commit()
    cur.close()
    return {"message": "Summary deleted"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)