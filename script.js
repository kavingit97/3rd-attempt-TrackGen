// File upload handler
document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission
    const formData = new FormData(this); // Create FormData from the form

    // Show loading indicator
    document.getElementById('result').innerHTML = 'Loading...';

    try {
        const response = await fetch('http://localhost:3000/upload', { // Pointing to localhost
            method: 'POST',
            body: formData // Send the FormData as the request body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        document.getElementById('result').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;

        // Display all uploaded images
        if (result.images && result.images.length > 0) {
            document.getElementById('screenshot').innerHTML = ''; // Clear previous images
            result.images.forEach(imgPath => {
                const img = new Image();
                const fullPath = `http://localhost:3000${imgPath}`; // Construct the full URL for the image
                console.log("Loading image from path:", fullPath); // Log the full path for debugging
                img.src = fullPath; // Set the source to the constructed path
                img.alt = "Uploaded file";
                img.onload = () => {
                    document.getElementById('screenshot').appendChild(img); // Append the image to the output div
                };
                img.onerror = (error) => {
                    console.error("Error loading image:", error); // Log error if image fails to load
                };
            });
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<pre>Error: ${error.message}</pre>`;
    }
});

// URL input handler
document.getElementById('urlForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission
    const url = this.url.value; // Get the URL value

    // Show loading indicator
    document.getElementById('result').innerHTML = 'Loading...';

    try {
        const response = await fetch('http://localhost:3000/url', { // Pointing to localhost
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }) // Send the URL in JSON format
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        document.getElementById('result').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;

        // Display the screenshot if available
        if (result.filePath) {
            const img = new Image();
            img.src = result.filePath; // Set the source to the screenshot path
            img.alt = "Screenshot";
            img.onload = () => {
                document.getElementById('screenshot').innerHTML = ''; // Clear previous images
                document.getElementById('screenshot').appendChild(img); // Append the image to the output div
            };
        }

        // Display Figma child canvases
        if (result.childrenSample) {
            const childrenContainer = document.createElement('div');
            childrenContainer.innerHTML = '<h3>Figma Child Canvases:</h3>';
            result.childrenSample.forEach(child => {
                const childDiv = document.createElement('div');
                childDiv.innerText = `Name: ${child.name}, Type: ${child.type}`;
                childrenContainer.appendChild(childDiv);
            });
            document.getElementById('result').appendChild(childrenContainer);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<pre>Error: ${error.message}</pre>`;
    }
});

// OpenCV.js Detection Function (same as previous)
function runOpenCVDetection(img) {
    const canvasOutput = document.getElementById('canvasOutput');
    const ctx = canvasOutput.getContext('2d');
    
    canvasOutput.width = img.width;
    canvasOutput.height = img.height;
    ctx.drawImage(img, 0, 0); // Draw the image on the canvas

    let src = cv.imread(canvasOutput); // Read the canvas as an image
    let gray = new cv.Mat();
    let edges = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Apply Canny Edge Detection
    cv.Canny(gray, edges, 50, 100);

    // Find contours
    cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    // Draw rectangles for detected contours
    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let rect = cv.boundingRect(cnt);
        let aspectRatio = rect.width / rect.height;

        // Filter for rectangular shapes (potential buttons)
        if (aspectRatio > 1.5 && aspectRatio < 4) { // Adjust ratio for button-like shapes
            let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            cv.rectangle(src, point1, point2, [255, 0, 0, 255], 2);
        }
    }

    // Display the output on the canvas
    cv.imshow('canvasOutput', src);

    // Clean up
    src.delete(); gray.delete(); edges.delete(); contours.delete(); hierarchy.delete();
}
