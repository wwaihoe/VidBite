# Use an official NVIDIA CUDA base image
FROM nvidia/cuda:12.4.1-cudnn-devel-ubuntu22.04

EXPOSE 8000

# Install Python 3 and development tools
RUN apt -y update 
RUN apt install -y apt-transport-https
RUN ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && echo $CONTAINER_TIMEZONE > /etc/timezone
RUN apt install -y python3
RUN apt install -y python3-pip
RUN apt install gcc -y 
RUN apt install ffmpeg -y 
RUN apt install -y postgresql
RUN apt install -y libpq-dev

WORKDIR /app

COPY ./requirements.txt .

RUN python3 -m pip install --upgrade pip

RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

RUN pip3 install --no-cache-dir --upgrade -r requirements.txt

RUN CMAKE_ARGS="-DGGML_CUDA=on" pip install llama-cpp-python

COPY ./app ./app

CMD ["fastapi", "run"]