import os
import torch
import gc
import string
from moviepy.editor import VideoFileClip
from transcript_model import TranscriptionModel
from llm import LlamaCPP


class VideoSummarizer:
  def __init__(self, transcript_model_str: str, llm_path: str):
    self.transcript_model_str = transcript_model_str
    self.llm_path = llm_path


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
    llm = LlamaCPP(model_path=self.llm_path)
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
   
<instruction>Summarise the following transcript of a video: <transcript>{transcript}</transcript></instruction><|eot_id|> 
<|start_header_id|>assistant<|end_header_id|>

<summary>"""
    summary = llm.generate(summarize_prompt)
    summary = summary.replace("</summary>", "")
    return summary


  def generate_sections(self, transcript: str, llm: LlamaCPP, max_tries: int=2):
    # Generate sections
    segment_prompt = f"""<|start_header_id|>user<|end_header_id|>
   
<instruction>Split the following transcript into suitable sections verbatim with these xml tags: "<section></section>" to demarcate each section in the transcript.
<transcript>{transcript}</transcript>Each section should contain only the exact text found in the transcript.</instruction><|eot_id|> 
<|start_header_id|>assistant<|end_header_id|>

<section>"""
    
    for i in range(max_tries):
      sections_str = llm.generate(segment_prompt)
      sections = sections_str.split("</section>")
      sections = [section.replace("<section>", "") for section in sections]
      sections = [section.replace("\n", "") for section in sections]
      sections = [section.strip() for section in sections]
      sections = [section for section in sections if not section.isspace() and not section == ""]
      print(sections)
      passed = True
      for section in sections:
        if not section in transcript:
          passed = False
          break
      if passed:
        return sections
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
   
<instruction>Summarise the following transcript into a few words: <transcript>{section}</transcript></instruction><|eot_id|> 
<|start_header_id|>assistant<|end_header_id|>

<summary>"""
        summary_short = llm.generate(summarize_short_prompt)
        summary_short = summary_short.replace("</summary>", "")

        # Generate summaries for each section
        summarize_full_prompt = f"""<|start_header_id|>user<|end_header_id|>
   
<instruction>Summarise the following transcript: <transcript>{section}</transcript></instruction><|eot_id|> 
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


video_summarizer = VideoSummarizer(transcript_model_str="medium", llm_path="models\Meta-Llama-3-8B-Instruct-Q4_K_M.gguf")

