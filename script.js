document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission
    const formData = new FormData(this); // Create FormData from the form

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
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<pre>Error: ${error.message}</pre>`;
    }
});

document.getElementById('urlForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission
    const url = this.url.value; // Get the URL value

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
        if (result.screenshot) {
            document.getElementById('screenshot').innerHTML = `
                <h3>Screenshot:</h3>
                <img src="${result.screenshot}" alt="Screenshot" style="max-width: 100%; height: auto;">
            `;
        }

        // Display the Figma document children sample
        if (result.childrenSample) {
            document.getElementById('result').innerHTML += `
                <h4>Figma Document Children Sample:</h4>
                <pre>${JSON.stringify(result.childrenSample, null, 2)}</pre>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<pre>Error: ${error.message}</pre>`;
    }
});
