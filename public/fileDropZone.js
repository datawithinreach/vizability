// Code for loading the initial VegaLite Spec
// Both Drag and Drop and Click operations are supported for loading in Spec from local machine

import { loadVGandSendToBackend } from "./vgLoader.js";

// Stores loaded VegaLite Spec and  accompanying Url/Values
var vegaLiteInfo = {};

// Event Listeners
document.getElementById('fileButton').addEventListener('click', openFileExplorer, false);

// Method 1
// User clicks on one of the first four buttons and loads in a hard coded benchmark dataset

const buttons = document.querySelectorAll(".method-1");

buttons.forEach(function (button) {
    button.addEventListener("click", async function () {
        console.log("Button clicked: " + button.textContent);
        document.getElementById("response-info").style.display = "none";
        // Render VegaLite Spec Corresponding to the Query being Asked
        const response = await fetch("/api/get-backend-file?file_path=./test/testVegaLiteSpecs/" + button.dataset.value + ".vg");
        const data = await response.json();
        const vLSpec = await JSON.parse(data.contents);
        // console.log(JSON.stringify(vLSpec));

        const vLData = {
            "contents": vLSpec
        };

        // Load VegaLite Spec to the Backend
        loadVGandSendToBackend(vLData);

        // Render QnA to the DOM
        document.getElementById("ask-question").style.display = "block";

        // Create a custom event with the updated vegaLiteSpec
        const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
            detail: vLData["contents"]
        });

        // Dispatch the event
        document.dispatchEvent(vegaLiteSpecEvent);
    });
});

// METHOD 2
// User clicks on the fifth button and subsequently selects .vg file from a file explorer pop up window

// Prompts File Explorer upon clicking the "Drop Vega Lite Spec Here" Input Box
function openFileExplorer() {
    document.getElementById('fileInput').click();
}

// Loads .vg file and data to the backend
document.getElementById('fileInput').addEventListener('change', async function (event) {
    vegaLiteInfo = await processFile(event.target.files);

    loadVGandSendToBackend(vegaLiteInfo);

    // Create a custom event with the updated vegaLiteSpec
    const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
        detail: vegaLiteInfo["contents"]
    });

    // Dispatch the event
    document.dispatchEvent(vegaLiteSpecEvent);
});

// HELPER FUNCTIONS

// Processes raw .vg file
async function processFile(files) {
    return new Promise((resolve, reject) => {
        if (files.length > 0) {
            var file = files[0]; // Get the first file from the list
            if (file.name.endsWith('.json') || file.name.endsWith('.vg')) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var contents = e.target.result; // Get the file contents as text
                    resolve({
                        "contents": contents,
                    })
                };
                reader.onerror = function (error) {
                    console.error('Error occurred while reading the file.', error);
                    reject(error);
                };
                reader.readAsText(file); // Read the file as text
            } else {
                alert('Please select a JSON or VG file.');
                resolve(null);
            }
        } else {
            resolve(null);
        }
    });
}
