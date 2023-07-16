// Code for loading the initial VegaLite Spec
// Both Drag and Drop and Click operations are supported for loading in Spec from local machine

import { loadVGandSendToBackend } from "./vgLoader.js";

// Stores loaded VegaLite Spec and  accompanying Url/Values
var vegaLiteInfo = {};

// Event Listeners
document.getElementById('dropZone').addEventListener('dragover', handleDragOver, false);
document.getElementById('dropZone').addEventListener('drop', handleFileSelect, false);
document.getElementById('dropZone').addEventListener('click', openFileExplorer, false);

// METHOD 1
// User selects, drags, and drops a local .vg file into the file drop zone

// Handles user dragging the file to file drop zone
function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

// Loads .vg file and data to the backend
async function handleFileSelect(event) {
    event.stopPropagation();
    event.preventDefault();
    vegaLiteInfo = await processFile(event.dataTransfer.files);

    loadVGandSendToBackend(vegaLiteInfo);

    // Create a custom event with the updated VegaLite Spec
    const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
        detail: vegaLiteInfo["contents"]
    });

    // Dispatch the event
    document.dispatchEvent(vegaLiteSpecEvent);
}

// METHOD 2
// User clicks on the file drop zone and subsequently selects .vg file from a file explorer pop up window

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
