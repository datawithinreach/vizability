// Load VegaLite Spec File and Send to Backend
export function loadVGandSendToBackend(vegaLiteInfo) {
    if (vegaLiteInfo) {
        const vegaLiteSpec = vegaLiteInfo["contents"];
        const dataToSend = {
            vgSpec: vegaLiteSpec
        }

        fetch("/api/process-vega-lite-spec", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
            .then(response => {
                if (response.ok) {
                    console.log('VG Spec sent successfully!');
                } else {
                    console.error('Failed to send VG Spec.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

export async function getVegaLiteSpec() {
    const filePath = "./spec/vega-lite-spec.vg"
    return fetch("/api/get-backend-file?file_path=" + filePath)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data.contents;
        })
}
