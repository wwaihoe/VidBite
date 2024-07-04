from llama_cpp import Llama


class LlamaCPP():
  def __init__(self, model_path: str, **kwargs):
    print(f"Loading model: {model_path}...")
    self.model_path = model_path
    self.llm = Llama(
      model_path=self.model_path,
      n_gpu_layers=-1,
      seed=1234,
      n_ctx=4096,
    )

    defaults = {
      "temperature": 1.0,
      "repeat_penalty": 1.025,
      "min_p": 0.5,
      "top_p": 1.0,
      "top_k": 0,
      "max_tokens": 4096,
    }
    defaults.update(kwargs)
    self.args = defaults

      
  def generate(self, prompt: str, **kwargs):
    llm_args = self.args
    llm_args.update(kwargs)
    print("Prompt: ", prompt)
    print("Args: ", llm_args)
    output = self.llm(
      prompt,
      echo=False,
      **llm_args
    )
    print(f"output: {output}")
    response = output["choices"][0]["text"]

    return response