// Code for loading the initial VegaLite Spec
// Both Drag and Drop and Click operations are supported for loading in Spec from local machine

import loadFileAndSendToBackend from "./fileLoader.js";
import { loadVGandSendToBackend, getVegaLiteSpec } from "./vgLoader.js";

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

    // Format of the data nested within the VegaLite Spec
    // Potential formats include .csv or .json
    await loadFileAndSendToBackend(vegaLiteInfo);
    loadVGandSendToBackend(vegaLiteInfo);
    const vegaLiteSpec = await getVegaLiteSpec();

    // Create a custom event with the updated VegaLite Spec
    const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
        detail: vegaLiteSpec,
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

    // Format of the data nested within the VegaLite Spec
    // Potential formats include .csv or .json
    await loadFileAndSendToBackend(vegaLiteInfo);
    loadVGandSendToBackend(vegaLiteInfo);
    const vegaLiteSpec = await getVegaLiteSpec();

    // Create a custom event with the updated vegaLiteSpec
    const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
        detail: vegaLiteSpec
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
                    var jsonData = JSON.parse(contents); // Parse the JSON data

                    var url = null;
                    var values = null;
                    if (jsonData.data && jsonData.data.url) {
                        url = jsonData.data.url; // Get the value of the nested ["data"]["url"] key
                        resolve({
                            "contents": contents,
                            "url": url
                        });
                    }

                    else if (jsonData.data && jsonData.data.values) {
                        values = jsonData.data.values;
                        resolve({
                            "contents": contents,
                            "values": values
                        });
                    }
                    else {
                        console.log('The JSON file does not contain the required key ["data"]["url"].');
                        resolve(null);
                    }
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
