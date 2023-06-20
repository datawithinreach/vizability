function loadFileAndSendToBackendHelper(vegaLiteInfo, format) {
    fetch(vegaLiteInfo["url"])
        .then(response => response.text())
        .then(data => {
            // Step 2: Send the file content as a comma-separated string to the backend using a POST request
            const dataToSend = {
                content: data
            };

            fetch("/api/process-" + format.toLowerCase(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            })
                .then(response => {
                    if (response.ok) {
                        console.log(format + ' file sent successfully!');
                    } else {
                        console.error('Failed to send ' + format + ' file.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

export default function loadFileAndSendToBackend(vegaLiteInfo) {
    // Step 1: Load CSV file from a URL using Fetch API
    if (vegaLiteInfo && vegaLiteInfo["url"]) {
        if (vegaLiteInfo["url"].endsWith(".csv")) {
            loadFileAndSendToBackendHelper(vegaLiteInfo, "CSV");
        }
        else if (vegaLiteInfo["url"].endsWith(".json")) {
            loadFileAndSendToBackendHelper(vegaLiteInfo, "JSON");
        }
    }
    else if (vegaLiteInfo && vegaLiteInfo["values"]) {
        const dataToSend = vegaLiteInfo["values"];
        fetch("/api/process-json", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
            .then(response => {
                if (response.ok) {
                    console.log('JSON file sent successfully!');
                } else {
                    console.error('Failed to send JSON file.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}
