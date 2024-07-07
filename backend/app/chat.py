import gc
import torch
from llm import LlamaCPP


class Chat:
  def __init__(self, llm_repo_id: str, llm_filename: str):
    self.llm_repo_id = llm_repo_id
    self.llm_filename = llm_filename

  def generate(self, query: str, transcript: str):
    llm = LlamaCPP(repo_id=self.llm_repo_id, filename=self.llm_filename)
    prompt = f"""<|start_header_id|>user<|end_header_id|>
   
<instruction>Answer the query using this context: <context>{transcript}</context></instruction>
<query>{query}</query><|eot_id|> 
<|start_header_id|>assistant<|end_header_id|>

<answer>"""

    response = llm.generate(prompt)
    response = response.replace("</answer>", "")

    # Clear memory
    del llm
    gc.collect()
    torch.cuda.empty_cache()

    return response
  

chat_model = Chat(llm_repo_id="bartowski/Meta-Llama-3-8B-Instruct-GGUF", llm_filename="Meta-Llama-3-8B-Instruct-Q4_K_M.gguf")