import { useState, useRef } from "react";
import { sendAudioData } from "../utils/helperFuncs";
import Button from 'react-bootstrap/Button';

const AudioRecorder = ({handleQuestionSubmit}) => {
    const [isRecording, setIsRecording] = useState(false)
    const [audioChunks, setAudioChunks] = useState([])
    const mediaRecorder = useRef(null);

    const startRecording = async () => {
        
        // get permission
        try {
            const streamData = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            //create new Media recorder instance using the stream
            const media = new MediaRecorder(streamData);
            //set the MediaRecorder instance to the mediaRecorder ref
            mediaRecorder.current = media;
            //invokes the start method to start the recording process
            mediaRecorder.current.start();
            let localAudioChunks = [];
            mediaRecorder.current.ondataavailable = (event) => {
                if (typeof event.data === "undefined") return;
                if (event.data.size === 0) return;
                localAudioChunks.push(event.data);
            };
            setAudioChunks(localAudioChunks);
        } catch (error) {
            alert("Error in enabling microphone: ", error)
        }
      };

    const stopRecording = () => {
        // setRecordingStatus("inactive");
        //stops the recording instance
        setIsRecording(false);
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = async () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

            // Send audio data to the backend
            const response = await sendAudioData(audioBlob);
            if (response.ok) {
                const transcription = await response.json();
                console.log('here', transcription)
                // send question to get answer
                handleQuestionSubmit(transcription["transcription"]["text"])
              } else {
                console.error("Failed to upload audio. Status:", response.status);
              }
            setAudioChunks([]);
        };
    };

    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    return (
        <Button variant="outline-secondary" onClick={toggleRecording}>
            {isRecording ? "Stop" : "Start"}
        </Button>
    )
}

export default AudioRecorder;