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
    return fetch("/api/get-vega-lite-spec")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data.contents;
        })
}
