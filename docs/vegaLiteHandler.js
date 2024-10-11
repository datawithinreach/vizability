import { loadVGandSendToBackend } from "./vgLoader.js";

const isProduction = window.location.hostname !== '127.0.0.1';
const serverAddress = isProduction
  ? "https://vizability-1006314949515.us-central1.run.app"
  : "http://127.0.0.1:8000";

// Stores loaded VegaLite Spec and accompanying URL/Values
let vegaLiteInfo = {};

// Event Listeners
document.getElementById('fileButton').addEventListener('click', openFileExplorer, false);

// Event Listeners for Method 1 buttons
const buttons = document.querySelectorAll(".method-1");
buttons.forEach(button => {
    button.addEventListener("click", handleMethod1ButtonClick);
});

/**
 * Handles the click event for Method 1 buttons.
 * Loads a hardcoded benchmark dataset and sends it to the backend.
 */
async function handleMethod1ButtonClick() {
    document.getElementById("load-content").style.display = "none";
    document.getElementById("suggestion-container").style.display = "none";
    document.getElementById("ask-question").style.display = "none";
    document.getElementById("QnA-header").style.display = "none";
    document.getElementById("accordion-container").style.display = "block";
    document.getElementById("top-hr").style.display = "block";
    document.getElementById("toggle-olli").classList.remove("hidden");
    document.getElementById("toggle-table").classList.remove("hidden");
    document.getElementById("response-info").style.display = "none";

    console.log("Button clicked: " + this.textContent);
    
    // Fetch the VegaLite Spec from the backend
    const response = await fetch(`${serverAddress}/api/get-backend-file?file_path=./test/testVegaLiteSpecs/${this.dataset.value}.vg`);
    const data = await response.json();
    const vLSpec = JSON.parse(data.contents);

    const vLData = { "contents": vLSpec };

    // Load VegaLite Spec to the backend
    loadVGandSendToBackend(vLData);

    // Show the QnA section
    document.getElementById("ask-question").style.display = "block";

    // Create and dispatch a custom event with the updated vegaLiteSpec
    const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
        detail: vLData["contents"]
    });
    document.dispatchEvent(vegaLiteSpecEvent);
}

/**
 * Prompts the file explorer upon clicking the "Drop Vega Lite Spec Here" input box.
 */
function openFileExplorer() {
    document.getElementById('fileInput').click();
}

// Event Listener for file input change
document.getElementById('fileInput').addEventListener('change', async function (event) {
    vegaLiteInfo = await processFile(event.target.files);
    if (vegaLiteInfo) {
        loadVGandSendToBackend(vegaLiteInfo);

        // Create and dispatch a custom event with the updated vegaLiteSpec
        const vegaLiteSpecEvent = new CustomEvent('vegaLiteSpecChange', {
            detail: vegaLiteInfo["contents"]
        });
        document.dispatchEvent(vegaLiteSpecEvent);
    }
});

/**
 * Processes the selected .vg file and reads its contents.
 * @param {FileList} files - The list of selected files.
 * @returns {Promise<Object>} The processed file data containing its contents.
 */
async function processFile(files) {
    return new Promise((resolve, reject) => {
        if (files.length > 0) {
            const file = files[0]; // Get the first file from the list
            if (file.name.endsWith('.json') || file.name.endsWith('.vg')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const contents = e.target.result; // Get the file contents as text
                    resolve({ "contents": contents });
                };
                reader.onerror = (error) => {
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
