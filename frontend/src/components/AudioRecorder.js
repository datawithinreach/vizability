import { useState, useRef } from "react";
import { sendAudioData } from "../utils/helperFuncs";

const AudioRecorder = () => {
    const [stream, setStream] = useState(undefined)
    const [isRecording, setIsRecording] = useState(false)
    const [audioChunks, setAudioChunks] = useState([])
    const mediaRecorder = useRef(null);

    async function toggleRecording() {
        try {
            if (!isRecording) {
                // get permission
                const streamData = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStream(streamData)
    
                // create media recorder instance
                const media = new MediaRecorder(stream);
                mediaRecorder.current = media;
    
                mediaRecorder.current.ondataavailable = function (event) {
                    if (event.data.size > 0) {
                        setAudioChunks([...audioChunks, event.data])
                    }
                };
    
                mediaRecorder.current.onstop = async function () {
                    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                    // creates a playable URL from the blob file.
                    // const audioUrl = URL.createObjectURL(audioBlob);
    
                    // Send audio data to the backend
                    const response = await sendAudioData(audioBlob);
                    // look at response TODO
    
                    // Reset the audioChunks array for the next recording
                    setAudioChunks([]);
                };
                mediaRecorder.current.start();
                console.log("Recording...");
                setIsRecording(true);
            } else {
                if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
                  mediaRecorder.current.stop();
                  console.log("Stop button clicked. Stopping recording...");
                }
                setIsRecording(false);
              }
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
        

    }

    
    return (
        <div>
            <button id="recordButton" type="button" aria-label="To begin voice input press enter. To end and submit, press enter again">
                <i id="record-button-i" class="fas fa-microphone"></i>
                <p id="record-button-p">Stop</p>
            </button>
        </div>
    )
}

export default AudioRecorder;