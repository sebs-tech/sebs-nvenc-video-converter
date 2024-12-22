document.addEventListener("DOMContentLoaded", function () {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const fileList = document.getElementById("file-list");
    const uploadBtn = document.getElementById("upload-btn");

    let fileInputClicked = false;  // To track if file input was clicked

    // Highlight the drop zone on dragover
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragging");
    });

    // Remove highlight when dragging leaves the drop zone
    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragging");
    });

    // Handle file drop
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragging");
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Trigger file input when clicking the drop zone
    dropZone.addEventListener("click", () => {
        if (!fileInputClicked) {
            fileInputClicked = true; // Set flag to prevent reopening
            fileInput.click();
        }
    });

    // Trigger file input when clicking the "Browse Files" button
    uploadBtn.addEventListener("click", () => {
        if (!fileInputClicked) {
            fileInputClicked = true; // Set flag to prevent reopening
            fileInput.click();
        }
    });

    // Handle file selection from the file input
    fileInput.addEventListener("change", (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFiles(files);
        }

        // Reset the file input for future selections
        fileInput.value = ""; // This allows for re-selection of the same file
        fileInputClicked = false;  // Reset the click flag
    });

    // Function to handle files and upload them
    function handleFiles(files) {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append("files[]", file);

            // Show file in the file list with "Uploading" status
            const fileItem = document.createElement("div");
            fileItem.className = "file-item uploading";
            fileItem.textContent = `Uploading: ${file.name}`;
            fileList.appendChild(fileItem);
        });

        // Send files to the backend for processing
        fetch("/upload", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.converted_files) {
                    // Remove "Uploading" entries and show "Converted" entries with a Download button
                    const uploadingItems = document.querySelectorAll(".file-item.uploading");
                    uploadingItems.forEach((item) => item.remove());

                    data.converted_files.forEach((filename) => {
                        // Create a new file item for the converted file
                        const fileItem = document.createElement("div");
                        fileItem.className = "file-item converted";
                        fileItem.textContent = `Converted: ${filename}`;

                        // Add a "Download" button
                        const downloadButton = document.createElement("button");
                        downloadButton.textContent = "Download";
                        downloadButton.className = "download-btn";
                        downloadButton.onclick = () => {
                            // Create a temporary link to download the file
                            const link = document.createElement('a');
                            link.href = `/download/${filename}`;
                            link.download = filename; // Specify the filename for download
                            link.click(); // Trigger the download
                        };

                        fileItem.appendChild(downloadButton);
                        fileList.appendChild(fileItem);
                    });
                } else if (data.error) {
                    alert(`Error: ${data.error}`);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while processing the files.");
            });
    }
});
