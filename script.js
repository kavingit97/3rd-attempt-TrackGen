document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    document.getElementById('result').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
});

document.getElementById('urlForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const url = this.url.value;

    const response = await fetch('/url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
    });

    const result = await response.json();
    document.getElementById('result').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    
    // Display the screenshot if available
    if (result.screenshot) {
        document.getElementById('screenshot').innerHTML = `
            <h3>Screenshot:</h3>
            <img src="${result.screenshot}" alt="Screenshot" style="max-width: 100%; height: auto;">
        `;
    }
});
