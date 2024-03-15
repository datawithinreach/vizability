import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Link,
  TextField,
} from "@mui/material";
import UAParser from "ua-parser-js";

import hotkeys from "hotkeys-js";

import { useNavigate } from "react-router-dom";
import { SessionContext } from "../contexts/Session";
import {
  getDefaults,
  getKeyBinds,
  getModifier,
  getSettings,
  generateTestInstruction,
} from "../libs/speech/utils";

import p5 from "p5";
import "p5.js-speech/lib/p5.speech";

const os = new UAParser().getOS();
const SETTINGS = getSettings();
const listeningKeys = getModifier(SETTINGS, false, false);
const defaults = getDefaults();

function Ready() {
  const navigate = useNavigate();
  function handleContinue(e) {
    console.log(_PID);

    if (!_PID) {
      e.preventDefault();
      setError("You have not entered the participant code.");
      setTimeout(function () {
        setError("");
      }, 5000);

      return;
    }
    setPID(_PID);
    navigate("/presurvey");
  }
  const ariaLiveEl = useRef(null);
  const [_PID, _setPID] = useState("");
  const [error, setError] = useState(""); // to show an error message
  const { setPID } = useContext(SessionContext);
  const instruction = generateTestInstruction(defaults.triggers, SETTINGS);
  console.log("instruction, ", instruction, defaults);
  function handleChange(event) {
    _setPID(event.target.value);
  }
  const echo = (text) => {
    if (!ariaLiveEl.current) {
      return;
    }
    if (!os.name.includes("Mac OS")) {
      ariaLiveEl.current.setAttribute("role", "alert");
    }
    ariaLiveEl.current.innerHTML = text;
  };
  useEffect(() => {
    const hotkeyScope = "practice";
    hotkeys.setScope(hotkeyScope);
    console.log(
      "bind key",
      getKeyBinds(listeningKeys, defaults.triggers.mainKey)
    );
    hotkeys(
      getKeyBinds(listeningKeys, defaults.triggers.mainKey),
      hotkeyScope,
      (event) => {
        event.preventDefault();
        console.log("callback called");
        const mic = new p5.SpeechRec();

        mic.onResult = () => {
          echo("I heard you say " + mic.resultString);
        };

        mic.onError = () => {
          const error = "There is something wrong with recognizing your voice.";
          echo(mic.resultString);
        };

        mic.start();

        function beep() {
          var snd = new Audio(
            "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
          );
          snd.play();
        }
        beep();
      }
    );

    return () => {
      console.log("removing hotkeys:", hotkeyScope);
      hotkeys.deleteScope(hotkeyScope);
    };
  }, []);

  const focusEl = useRef(null);
  useEffect(() => {
    focusEl.current.focus();
  }, []);

  return (
    <Container maxWidth="md" m={5}>
      <Typography mt={3} variant="h3" ref={focusEl} tabIndex={-1}>
        Let's get ready
      </Typography>
      <Typography mt={3} variant="h6" gutterBottom>
        Study Structure
      </Typography>
      <p>
        This study consists of three phases. In the first phase, we will have a
        simple background survey asking general information about you. We then
        move onto the main study phase. There, you will get to know three
        different methods to make chart data accessible, including{" "}
        <strong>data tables</strong>,&nbsp;
        <strong>structured navigation</strong>, and{" "}
        <strong>speech-based interaction</strong>.
      </p>
      <p>
        For each method, we will ask you to answer questions and rate your
        experience so that we can observe how well it supports users. Some of
        these methods are experimental, and thus you may encounter limitations
        and difficulties. Don't worry, we are not evaluating your performance,
        we are looking for the weaknesses and strengths of each method.
      </p>
      <p>
        In the final phase, we will ask you about your overall feedback
        comparing all three methods.
      </p>
      <Typography mt={3} variant="h6" gutterBottom>
        Study Settings
      </Typography>
      <p>
        Please go to <strong>Zoom and start sharing your full screen</strong> now. In your screen reader settings, please make your visual cursor visible.
      </p>

      <p>
        We may use your microphone for the speech-based interaction condition.{" "}
        If a pop up window appears, asking for permission to use your
        microphone, please allow access. {instruction}
      </p>
      <Box component="blockquote" mt={3} aria-live="assertive" ref={ariaLiveEl}>
        This text will change based on your speech.
      </Box>

      {/* <p>
        For the structured navigation method, we will need to use arrow keys. To
        avoid conflict, we may need to turn on/off a certain mode in your screen
        reader, and you may not use trackpad navigation. Here is a way to
        configure the setting depending on your screen reader:
      </p>
      <ul>
        <li>
          VoiceOver: Quick nav toggle (press left/right at the same time).
        </li>
        <li>
          Trackpad commander: hold VO keys and rotate two fingers on the
          trackpad
        </li>
        <li>Windows Narrator: Scan mode off (CapsLock + Spacebar)</li>
        <li>
          NVDA: Focus mode (Insert + Spacebar). Sometimes CapsLock instead of
          Insert!
        </li>
        <li>JAWS: Forms mode (press enter on the application element; exiting forms mode: esc and numpad plus)</li>
      </ul> */}

      <p>
        Please type your participant code in the text box below. Once everything is ready, please
        click the button on the bottom of the page to continue to the
        background survey.
      </p>

      <TextField
        fullWidth
        label="Type Your Participant Code Here"
        variant="outlined"
        value={_PID}
        onChange={handleChange}
      />

      <Typography variant="subtitle1" color="error" aria-live="assertive">
        {error}
      </Typography>

      <Box mt={5}>
        <Button variant="contained" fullWidth onClick={handleContinue}>
          Continue to Background Survey
        </Button>
      </Box>
    </Container>
  );
}

export default Ready;
