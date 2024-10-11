const isProduction = window.location.hostname !== '127.0.0.1';
const serverAddress = isProduction
  ? "https://vizability-1006314949515.us-central1.run.app"
  : "http://127.0.0.1:8000";

/**
 * Array to store audio data chunks during recording.
 * @type {Blob[]}
 */
let audioChunks = [];

/**
 * MediaRecorder instance for recording audio.
 * @type {MediaRecorder}
 */
let mediaRecorder;

/**
 * Flag indicating whether recording is in progress.
 * @type {boolean}
 */
let isRecording = false;

// DOM elements
const recordButton = document.getElementById("recordButton");
const recordButtonIcon = document.getElementById("record-button-i");
const recordButtonPlayback = document.getElementById("record-button-p");

// Event listener for the record button
recordButton.addEventListener("click", toggleRecording);

/**
 * Toggles the recording state.
 * Starts recording if not currently recording, otherwise stops recording.
 * @async
 * @function
 */
async function toggleRecording() {
  try {
    if (!isRecording) {
      // Request user media permissions and initialize MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      // Handle incoming data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      // Handle stopping of recording
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Send audio data to the backend
        sendAudioData(audioBlob);

        // Clear audio chunks for next recording
        audioChunks = [];
      };

      // Start recording
      mediaRecorder.start();
      console.log("Recording...");
      isRecording = true;
      recordButtonIcon.style.display = "none";
      recordButtonPlayback.style.display = "block";
    } else {
      // Stop recording if already in progress
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log("Stopping recording...");
      }
      isRecording = false;
      recordButtonIcon.style.display = "block";
      recordButtonPlayback.style.display = "none";
    }
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
}

/**
 * Sends the recorded audio data to the backend for processing.
 * @param {Blob} audioBlob - The audio data as a Blob.
 * @async
 * @function
 */
async function sendAudioData(audioBlob) {
  const formData = new FormData();
  formData.append("audioFile", audioBlob, "recorded_audio.wav");

  try {
    const response = await fetch(`${serverAddress}/api/upload-audio`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const transcription = await response.json();
      console.log("Transcription:", transcription);

      // Update the user query with the transcription text
      const userQuery = document.getElementById("user-query");
      userQuery.value = transcription.transcription.text;
      userQuery.setAttribute("aria-live", "assertive");

      // Submit the form
      const formSubmit = document.getElementById('ask-question-button');
      formSubmit.click();
    } else {
      console.error("Failed to upload audio. Status:", response.status);
    }
  } catch (error) {
    console.error("Error uploading audio:", error);
  }
}
