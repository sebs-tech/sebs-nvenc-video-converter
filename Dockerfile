# Use a Ubuntu base image
FROM ubuntu:24.04

# Set metadata
LABEL maintainer="Sebastjan Rijavec <sebastjan.rijavec@gmail.com>"
LABEL description="A Docker running ffmpeg to encode videos with nvenc"

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Set environment variable for NVIDIA capabilities
ENV NVIDIA_DRIVER_CAPABILITIES=all

# Install curl and gpg
RUN apt-get update && apt-get install -y curl gpg 

# Get nvidia gpgkey and keyring
RUN curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg 

# Get nvidia-container-toolkit 
RUN curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# Install tested nvidia driver 
RUN apt update && apt install -y nvidia-driver-525

# Install ffmpeg
RUN apt update && apt install -y ffmpeg

# Update package repository and install essential packages
RUN apt-get update && apt-get install -y \
    build-essential \
    nvidia-container-toolkit \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python 3.12 and pip
RUN apt update && apt install -y python3.12 && apt install -y python3-pip && apt install -y python3.12-venv

# Create a virtual environment
RUN python3.12 -m venv /app/venv

# Set working directory
WORKDIR /app

# Copy project files to the container
COPY . /app

# Activate the virtual environment and install dependencies
RUN /bin/bash -c "source /app/venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt"

# Expose application port (if needed)
EXPOSE 5000

# Set the default command to run the app with the virtual environment activated
CMD ["/app/venv/bin/python3", "app.py"]
