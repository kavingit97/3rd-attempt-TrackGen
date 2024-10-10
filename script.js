document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        document.getElementById('result').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        if (result.screenshot) {
            const img = new Image();
            img.src = result.screenshot;
            img.onload = () => runOpenCVDetection(img);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<pre>Error: ${error.message}</pre>`;
    }
});

// URL Form Handler
document.getElementById('urlForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const url = this.url.value;

    try {
        const response = await fetch('http://localhost:3000/url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        document.getElementById('result').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        
        // Handle screenshot and display it for detection
        if (result.screenshot) {
            const img = new Image();
            img.src = result.screenshot;
            img.onload = () => runOpenCVDetection(img);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<pre>Error: ${error.message}</pre>`;
    }
});

// OpenCV.js Detection Function
function runOpenCVDetection(img) {
    const canvasOutput = document.getElementById('canvasOutput');
    const ctx = canvasOutput.getContext('2d');
    
    canvasOutput.width = img.width;
    canvasOutput.height = img.height;
    ctx.drawImage(img, 0, 0);

    let src = cv.imread(canvasOutput);
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

    // Display the output
    cv.imshow('canvasOutput', src);

    // Clean up
    src.delete(); gray.delete(); edges.delete(); contours.delete(); hierarchy.delete();
}
