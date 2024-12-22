from flask import Flask, request, jsonify, send_from_directory, render_template
import os
import subprocess
from werkzeug.utils import secure_filename

# Initialize the Flask app
app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'converted'
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'mkv', 'avi'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to serve the frontend HTML page
@app.route('/')
def index():
    return render_template('index.html')

# Route to handle file uploads and conversion
@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files[]' not in request.files:
        return jsonify({'error': 'No files were uploaded'}), 400

    files = request.files.getlist('files[]')
    converted_files = []

    for file in files:
        if file and allowed_file(file.filename):
            # Save the uploaded file
            filename = secure_filename(file.filename)
            input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(input_path)

            # Define the output file path
            output_filename = f"{os.path.splitext(filename)[0]}_converted.mp4"
            output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)

            # Convert the video with FFmpeg using NVIDIA encoder
            ffmpeg_command = [
                'ffmpeg', '-y', '-i', input_path,
                '-c:v', 'h264_nvenc', output_path
            ]

            try:
                subprocess.run(ffmpeg_command, check=True)
                converted_files.append(output_filename)
            except subprocess.CalledProcessError as e:
                return jsonify({'error': f"FFmpeg conversion failed for {filename}"}), 500
        else:
            return jsonify({'error': f"File {file.filename} is not allowed"}), 400

    return jsonify({'converted_files': converted_files}), 200

# Route to download converted files
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
