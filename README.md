# Seb's Nvenc Video Converter 

Docker to convert videos in mp4 format using ffmpeg (nvenc) 

### Build 
```bash
docker build -t sebs-video-converter .
```

### Run 
```bash
docker run -p 5000:5000 --rm --gpus all sebs-video-converter
```
