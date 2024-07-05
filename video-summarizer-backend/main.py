import uvicorn
from fastapi import FastAPI, File, UploadFile, Form
from pipeline import video_summarizer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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


@app.get("/")
def root():
    return {"message": "Server online"}


class SectionsTimeStamps(BaseModel):
    timestamps: tuple[int, int]
    text: str
    summary: str

class SummaryResponse(BaseModel):
    summary: str
    sections_timestamps: list[SectionsTimeStamps]

@app.post("/summarise")
def summarise(file: UploadFile = File(...), response_model=SummaryResponse):
    file_path = f"./public/uploads/{file.filename}"
    with open(file_path, "wb+") as file_object:
        file_object.write(file.file.read())
    result = video_summarizer.summarize(file_path)
    print("Summary complete")
    return result

@app.post("/upload")
def upload_file(file: UploadFile):
    file_path = f"./public/uploads/{file.filename}"
    with open(file_path, "wb+") as file_object:
        file_object.write(file.file.read())
    return {"message": "Uploaded file: " + file.filename}



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)