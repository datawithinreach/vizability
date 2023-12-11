let audioChunks = [];
let mediaRecorder;
let isRecording = false;

const recordButton = document.getElementById("recordButton");
const recordButtonI = document.getElementById("record-button-i");
const recordButtonP = document.getElementById("record-button-p");
recordButton.addEventListener("click", toggleRecording);

async function toggleRecording() {
  try {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = function () {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Send audio data to the backend
        sendAudioData(audioBlob);

        // Reset the audioChunks array for the next recording
        audioChunks = [];
      };

      mediaRecorder.start();
      console.log("Recording...");
      isRecording = true;
      recordButtonI.style.display = "none";
      recordButtonP.style.display = "block";
    } else {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log("Stop button clicked. Stopping recording...");
      }
      isRecording = false;
      // recordButton.textContent = "Start Recording";
      recordButtonI.style.display = "block";
      recordButtonP.style.display = "none";
    }
  } catch (err) {
    console.error("Error accessing microphone:", err);
  }
}

async function sendAudioData(audioBlob) {
    const formData = new FormData();
    formData.append("audioFile", audioBlob, "recorded_audio.wav");
  
    try {
      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const transcription = await response.json();
        console.log("Transcription:", transcription);
        const userQuery = document.getElementById("user-query");
        userQuery.value = transcription["transcription"]["text"];
        userQuery.setAttribute("aria-live", "assertive");
        const formSubmit = document.getElementById('ask-question-button');
        formSubmit.click();
      } else {
        console.error("Failed to upload audio. Status:", response.status);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
}
