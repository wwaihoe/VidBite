import torch
import whisper_timestamped as whisper


device = "cuda" if torch.cuda.is_available() else "cpu"

class TranscriptionModel:
  def __init__(self, model_str: str, device: str=device):
    self.model = whisper.load_model("medium", device="cuda")

  def generate_transcript(self, audio_path: str, language: str="en"):
    audio = whisper.load_audio(audio_path)
    result = whisper.transcribe(self.model, audio, language=language)
    return result

