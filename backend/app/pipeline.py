import os
import torch
import gc
import string
from moviepy.editor import VideoFileClip
from transcript_model import TranscriptionModel
from llm import LlamaCPP


class VideoSummarizer:
  def __init__(self, transcript_model_str: str, llm_repo_id: str, llm_filename: str):
    self.transcript_model_str = transcript_model_str
    self.llm_repo_id = llm_repo_id
    self.llm_filename = llm_filename

  def summarize(self, video_path: str, language: str="en"):
    # Create a video clip object
    clip = VideoFileClip(video_path)
    # Extract audio and save as mp3
    audio_path = os.path.splitext(video_path)[0]+".mp3"
    clip.audio.write_audiofile(audio_path)

    # Generate transcript
    transcript_model = TranscriptionModel(model_str=self.transcript_model_str)
    result = transcript_model.generate_transcript(audio_path, language=language)
    transcript = result["text"]

    # Clear memory
    del transcript_model
    gc.collect()
    torch.cuda.empty_cache()

    # Generate summary
    llm = LlamaCPP(repo_id=self.llm_repo_id, filename=self.llm_filename)
    summary = self.generate_summary(transcript, llm)
    
    # Generate sections
    sections = self.generate_sections(transcript, llm)

    if sections is None:
      return {"summary": summary, "sections_timestamps": None}

    # Generate timestamps for sections
    sections_timestamps = self.generate_sections_timestamps(sections, result, llm)

    # Clear memory
    del llm
    gc.collect()
    torch.cuda.empty_cache()

    return {"summary": summary, "sections_timestamps": sections_timestamps}
  

  def generate_summary(self, transcript: str, llm: LlamaCPP):
    # Summarize transcript
    summarize_prompt = f"""<|start_header_id|>user<|end_header_id|>
   
<instruction>Summarise the video: <transcript>{transcript}</transcript></instruction><|eot_id|> 
<|start_header_id|>assistant<|end_header_id|>

<summary>"""
    summary = llm.generate(summarize_prompt)
    summary = summary.replace("</summary>", "")
    return summary


  def generate_sections(self, transcript: str, llm: LlamaCPP, max_tries: int=2):
    # Generate sections
    segment_prompt = f"""<|start_header_id|>user<|end_header_id|>
   
<instruction>Split the following video into suitable sections verbatim with these xml tags: "<section></section>" to demarcate each section in the video.
<transcript>{transcript}</transcript>Each section should contain only the exact text found in the transcript.</instruction><|eot_id|> 
<|start_header_id|>assistant<|end_header_id|>

<section>"""
    
    # Check if the section words are in the transcript and retry if not
    transcript_words = [word.lower().strip(string.punctuation) for word in transcript.split()]
    for i in range(max_tries):
      sections_str = llm.generate(segment_prompt)
      sections_str = sections_str.replace("\n", "")
      sections_str = sections_str.replace("</section>", "")
      sections = sections_str.split("<section>")
      sections = [section for section in sections if not section.isspace() and not section == ""]
      passed = True
      
      for section in sections:
        section_words = section.split()
        section_words = [word.lower().strip(string.punctuation) for word in section_words]
        check = all(word in transcript_words for word in section_words)
        if not check:
          passed = False
          break
      if passed:
        return sections
      else:
        return None


  def generate_sections_timestamps(self, sections: list[str], word_data: dict, llm: LlamaCPP):
    sections_timestamps = []
    word_index = 0
    words_time = []
    for segment in word_data["segments"]:
        words_time.extend(segment["words"])
    
    for section in sections:
        # Generate summaries for each section
        summarize_short_prompt = f"""<|start_header_id|>user<|end_header_id|>
   
<instruction>Summarise the following video into a few words: <transcript>{section}</transcript></instruction><|eot_id|> 
<|start_header_id|>assistant<|end_header_id|>

<summary>"""
        summary_short = llm.generate(summarize_short_prompt)
        summary_short = summary_short.replace("</summary>", "")

        # Generate summaries for each section
        summarize_full_prompt = f"""<|start_header_id|>user<|end_header_id|>
   
<instruction>Summarise the following video: <transcript>{section}</transcript></instruction><|eot_id|> 
<|start_header_id|>assistant<|end_header_id|>

<summary>"""
        summary_full = llm.generate(summarize_full_prompt)
        summary_full = summary_full.replace("</summary>", "")

        # Get start and end times for each section
        words = section.split()
        section_start = None
        section_end = None
        
        for word in words:
            while word_index < len(words_time):
                current_word = words_time[word_index]
                if current_word['text'].lower().strip(string.punctuation) == word.lower().strip(string.punctuation):
                    if section_start is None:
                        section_start = current_word['start']
                    section_end = current_word['end']
                    word_index += 1
                    break
                word_index += 1
        
        if section_start is not None and section_end is not None:
            sections_timestamps.append({"timestamps": (section_start, section_end), "text": section, "summary_short": summary_short, "summary_full": summary_full})
        else:
            sections_timestamps.append({"timestamps": (None, None), "text": section, "summary_short": summary_short, "summary_full": summary_full})
    return sections_timestamps


video_summarizer = VideoSummarizer(transcript_model_str="medium", llm_repo_id="bartowski/Meta-Llama-3.1-8B-Instruct-GGUF", llm_filename="Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf")

