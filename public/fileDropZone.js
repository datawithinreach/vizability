import loadFileAndSendToBackend from "./fileLoader.js";
import { loadVGandSendToBackend, getVegaLiteSpec } from "./vgLoader.js";

var vegaLiteInfo = {};

document.getElementById('dropZone').addEventListener('dragover', handleDragOver, false);
document.getElementById('dropZone').addEventListener('drop', handleFileSelect, false);
document.getElementById('dropZone').addEventListener('click', openFileExplorer, false);

function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

async function handleFileSelect(event) {
    event.stopPropagation();
    event.preventDefault();
    vegaLiteInfo = await processFile(event.dataTransfer.files);
    console.log(vegaLiteInfo);
    loadFileAndSendToBackend(vegaLiteInfo);
    loadVGandSendToBackend(vegaLiteInfo);
    const vegaLiteSpec = await getVegaLiteSpec();
    // console.log(vegaLiteSpec);

    // Create a custom event with the updated vegaLiteSpec
    const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
        detail: vegaLiteSpec,
    });

    // Dispatch the event
    document.dispatchEvent(vegaLiteSpecEvent);
}

function openFileExplorer() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', async function (event) {
    vegaLiteInfo = await processFile(event.target.files);
    console.log(vegaLiteInfo);
    loadFileAndSendToBackend(vegaLiteInfo);
    loadVGandSendToBackend(vegaLiteInfo);
    const vegaLiteSpec = await getVegaLiteSpec();
    // console.log(vegaLiteSpec);

    // Create a custom event with the updated vegaLiteSpec
    const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
        detail: vegaLiteSpec,
    });

    // Dispatch the event
    document.dispatchEvent(vegaLiteSpecEvent);
});

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
                    }

                    else if (jsonData.data && jsonData.data.values) {
                        values = jsonData.data.values;
                    }

                    if (url) {
                        // The ["data"]["url"] key is present and its value is not null
                        // console.log('URL:', url);
                        resolve({
                            "contents": contents,
                            "url": url
                        });
                    } 
                    else if (values) {
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
                reader.onerror = function (e) {
                    console.error('Error occurred while reading the file.', e);
                    reject(e);
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
