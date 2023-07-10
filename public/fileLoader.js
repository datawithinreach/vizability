function loadFileAndSendToBackendHelper(vegaLiteInfo, format) {
    fetch(vegaLiteInfo["url"])
        .then(response => {
            if (format == "json") {
                return response.json();
            } else if (format == "csv") {
                return response.text();
            } else {
                throw new Error("Unsupported format: " + format);
            }
        })
        .then(data => {
            // Step 2: Send the file content as a comma-separated string to the backend using a POST request
            const dataToSend = {
                content: data
            };

            fetch("/api/process-" + format, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            })
                .then(response => {
                    if (response.ok) {
                        console.log('CSV file sent successfully!');
                    } else {
                        console.error('Failed to send CSV file.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
    // .catch(error => {
    //     console.error('Error:', error);
    // });
}

export default async function loadFileAndSendToBackend(vegaLiteInfo) {
    // Step 1: Load CSV file from a URL using Fetch API
    if (vegaLiteInfo && vegaLiteInfo["url"]) {
        if (vegaLiteInfo["url"].endsWith(".csv")) {
            loadFileAndSendToBackendHelper(vegaLiteInfo, "csv");
        } else if (vegaLiteInfo["url"].endsWith(".json")) {
            loadFileAndSendToBackendHelper(vegaLiteInfo, "json");
        }
    } else if (vegaLiteInfo && vegaLiteInfo["values"]) {
        const dataToSend = {
            content: vegaLiteInfo["values"]
        };
        try {
            const response = await fetch("/api/process-json", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                console.log('CSV file sent successfully!');
            } else {
                console.error('Failed to send CSV file.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}
