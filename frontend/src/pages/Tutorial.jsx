import React, { useState, useContext, useEffect, useRef } from "react";
import { Box, Container, Typography, Button } from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import { SessionContext } from "../contexts/Session";

import Questionnaire from "../components/Questionaire.jsx";
import BasicTutorial from "../components/BasicTutorial.jsx";
// import SpeechTutorial from "components/SpeechTutorial";
// import StructuredTutorial from "components/StructuredTutorial";

import {
  generateExplanation,
  getDefaults,
  getSettings,
} from "../libs/speech/utils";
import toTitleCase from "../utils/toTitleCase.js";

const SETTINGS = getSettings();
const defaults = getDefaults();

function Tutorial() {
  // const baseURL = process.env.PUBLIC_URL;
  const params = useParams();
  const navigate = useNavigate();
  //   console.log(params);
  const { setup, setTutorialResponse, setLog } = useContext(SessionContext);
  //   console.log("setup", setup);
  const config = !setup ? null : setup[params.stage];
  //   console.log("config", config);
  const [status, setStatus] = useState("preview");

  const taskEl = useRef(null);
  const focusEl = useRef(null);
  const btnEl = useRef(null);

  useEffect(() => {
    // console.log("focus:", focusEl.current);
    if (focusEl.current) {
      focusEl.current.focus();
    }
  }, [config]);

  useEffect(() => {
    console.log("status", status);
    if (status === "question" && taskEl.current) {
      taskEl.current.focus();
    }
    if (status === "complete" && btnEl.current) {
      btnEl.current.focus();
    }
  }, [status]);

  const table = [
    // {
    //   prompt: "What is the number of Covid cases in France?",
    //   type: "radiogroup",
    //   response: "",
    //   answer: "29,700,000",
    //   options: [
    //     "29,700,000",
    //     "15,004,000",
    //     "40,738,000",
    //     "This cannot be answered based on the information in the chart.",
    //     "The answer is there but I can't find it.",
    //   ],
    // },
    {
      prompt: "Which country has the lowest number of covid cases in America?",
      type: "radiogroup",
      response: "",
      answer: "Argentina",
      options: [
        "United States",
        "Brazil",
        "Argentina",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
    {
      prompt:
        "Which country has a higher number of Covid cases, France or United Kingdom?",
      type: "radiogroup",
      response: "",
      answer: "France",
      options: [
        "France",
        "United Kingdom",
        "They are the same",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
    {
      prompt: "What is the median covid case in America?",
      description:
        "The median of a dataset is the middle value. If there is an even number of data points, the median is the average of the two middle values",
      type: "radiogroup",
      response: "",
      answer: "32,000,000",
      options: [
        "32,000,000",
        "36,000,000",
        "28,000,000",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
  ];
  const structured = [
    // {
    //   prompt: "What is the number of Covid cases in Argentina?",
    //   type: "radiogroup",
    //   response: "",
    //   answer: "9,370,000",
    //   options: [
    //     "9,370,000",
    //     "6,887,964",
    //     "15,470,000",
    //     "This cannot be answered based on the information in the chart.",
    //     "The answer is there but I can't find it.",
    //   ],
    // },
    {
      prompt: "What country has the lowest number of covid cases?",
      type: "radiogroup",
      response: "",
      answer: "Netherlands",
      options: [
        "South Korea",
        "Netherlands",
        "Brazil",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
    {
      prompt:
        "Which country has a higher number of Covid cases, Argentina or Brazil?",
      type: "radiogroup",
      response: "",
      answer: "Brazil",
      options: [
        "Argentina",
        "Brazil",
        "They are the same",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
    {
      prompt:
        "What is the average covid case in Asia? Please try to choose the closest answer.",
      type: "radiogroup",
      response: "",
      answer: "20,410,000",
      options: [
        "30,410,000",
        "20,410,000",
        "10,410,000",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
  ];

  const speech = [
    // {
    //   prompt: "What is the number of Covid cases in Spain?",
    //   type: "radiogroup",
    //   response: "",
    //   answer: "12,700,000",
    //   options: [
    //     "29,700,000",
    //     "12,700,000",
    //     "40,738,000",
    //     "This cannot be answered based on the information in the chart.",
    //     "The answer is there but I can't find it.",
    //   ],
    // },
    {
      prompt:
        "What continent has the lowest average of Covid cases? Please try to choose the closest answer.",
      type: "radiogroup",
      response: "",
      answer: "Europe",
      options: [
        "Europe",
        "Asia",
        "America",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
    {
      prompt:
        "Which country has a higher number of Covid cases, South Korea or Vietnam?",
      type: "radiogroup",
      response: "",
      answer: "South Korea",
      options: [
        "South Korea",
        "Vietnam",
        "They are the same",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
    {
      prompt:
        "What is the average covid case in Europe? Please try to choose the closest answer.",
      type: "radiogroup",
      response: "",
      answer: "19,068,750",
      options: [
        "29,068,750",
        "9,068,750",
        "19,068,750",
        "None of the above is the correct answer",
        "Unable to extract information",
      ],
    },
  ];
  const questionPool = {
    table,
    structured,
    speech,
  };
  const questions = config ? questionPool[config.method] : []; //[params.stage];
  const [curResp, setCurResp] = useState();
  const [responses, setResponses] = useState([]);
  const [curQIdx, setCurrQIdx] = useState(0);
  const [currQuestion, setCurrQuestion] = useState([]);
  const [startTime, setStartTime] = useState();
  const [error, setError] = useState("");

  function nextQuestion() {
    // console.log("nextQuestion", curResp);
    const incomplete =
      !curResp ||
      [curResp].some((q) =>
        q.type === "checkbox"
          ? q.response.every((r) => r === false)
          : q.response === ""
      );

    if (incomplete) {
      setError("You have unanswered questions.");
      setTimeout(() => {
        setError("");
      }, "3000");
      return;
    }
    const incorrect =
      !curResp ||
      [curResp].some((q) =>
        q.type === "checkbox"
          ? q.response.every((r) => !q.answer.includes(r))
          : q.response !== q.answer
      );
    if (incorrect) {
      setError(
        "You have incorrect response. You need to choose the right answer in this tutorial before moving onto the actual task."
      );
      setTimeout(() => {
        setError("");
      }, "3000");
      return;
    }
    // compute the response time and update
    const newIdx = curQIdx + 1;
    // compute time span
    const timespan = new Date().getTime() - startTime;
    console.log("response, timespan", curResp, timespan);
    setResponses(responses.concat({ response: curResp, timespan }));

    setTimeout(function () {
      setError("");
    }, 3000);

    if (newIdx >= questions.length) {
      setStatus("complete");
    } else {
      // start a new question
      setCurrQIdx(newIdx);
      setCurrQuestion([questions[newIdx]]);
      setCurResp(null);
      // timer reset
      setStartTime(new Date().getTime());
    }
  }
  function startPractice() {
    setStatus("question");
    setCurrQIdx(0);
    setCurrQuestion([questions[0]]);
    // start timer
    console.log("start timing");
    setStartTime(new Date().getTime());
    //set focus to task question
  }

  function handleResponse(responses) {
    const response = responses[0]; // save this
    console.log("response", response);
    setCurResp(response);
  }
  function handleContinue() {
    setTutorialResponse(responses, params.stage);
    navigate(`/task/${params.stage}`);
  }
  function handleLog(name, data, datetime) {
    setLog({
      stage: params.stage,
      chart: "tutorial",
      method: config.method,
      name,
      data,
      datetime,
    });
  }
  function renderStimuli(config) {
    switch (config.method) {
      case "table":
        return <BasicTutorial onLog={handleLog} />;
    //   case "structured":
    //     return <StructuredTutorial onLog={handleLog} />;
    //   case "speech":
    //     return <SpeechTutorial onLog={handleLog} />;
      default:
        return;
    }
  }
  function renderMethodName(config) {
    switch (config.method) {
      case "table":
        return "data table";
      case "structured":
        return "structured navigation";
      case "speech":
        return "speech interaction";
    }
  }
  function renderExplanation(config) {
    switch (config.method) {
      case "table":
        return (
          <p>
            For the data table method, you can use your screen reader to read a
            text alternative to the chart (alt text) when your tab-focus is on
            the chart image. To navigate through the underlying data of the
            chart, a corresponding data table is provided below the chart. You
            can use your screen reader to browse through the data table. You can
            sort the table by clicking the headers.
          </p>
        );
      case "structured":
        return (
          <div>
            <p>
              For the structured navigation method, you use the arrow keys of
              your keyboard to navigate through different layers of the chart.
              Each layer has a different level of detail and you can move
              between the levels using "up" and "down" arrow keys. At the top
              layer, you have the chart summary. When you press "down", you will
              have a chart encoding layer such as a horizontal axis, vertical
              axis, or color legend. Below, you have data groups and individual
              data values.
            </p>
            <p>
              At each layer, you can press "left" and "right" to navigate across
              the same level, such as switching between different axes and
              legend or moving between data groups and individual data points.
            </p>
            <p>
              Press the tab key to navigate to the chart where you hear the
              following prompt: "Please use the arrow keys or WASD keys to
              navigate this chart object."
            </p>
            <p>
              To use arrow keys without conflict, you may need to turn on/off a
              certain mode in your screen reader, and you may not use trackpad
              navigation. Here is a way to configure the setting depending on
              your screen reader:
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
                NVDA: Focus mode (Insert + Spacebar). Sometimes CapsLock instead
                of Insert!
              </li>
              <li>
                JAWS: Forms mode (press enter on the application element;
                exiting forms mode: esc and numpad plus)
              </li>
            </ul>
            <p>
              If the arrow keys still do not work, you can try WASD keys
              instead. Please ask for help from the researcher if you run into
              issues.
            </p>
          </div>
        );
      case "speech":
        return (
          <div>
            <p>
              For the speech interaction method, you may use your microphone to
              ask questions about the chart. If a pop up window appears, asking
              for permission to use your microphone, please allow access. Please
              also keep in mind that the system might still has some
              limitations.
            </p>

            <ol>
              <li>
                The system can look up specific values, it can find the highest
                or lowest values, it can provide average, median, or total sum
                of values, and it can give you a summary of the chart.
              </li>
              <li>
                Your questions must contain keywords which the system can
                understand. The keywords include the charts category labels and
                numeric variable names.
              </li>
            </ol>

            {/* For the speech interaction method, you can press a key-combination
              to ask questions about the chart. First, try to listen to the
              summary of the chart to understand what is presented and then ask
              more specific questions. The speech method is quite limited at
              this point. It can only answer simple value look up, extrema
              questions such as maximum and minimum, and aggregate operations
              such as average, median, and total sum. */}

            <p>
              You can ask <i>"What is the summary of the chart?"</i>, to hear
              all category labels and variable names.
            </p>
            <Typography id="possible-questions" variant="h5" gutterBottom>
              Examples of possible questions
            </Typography>
            <ul aria-labelledby="possible-questions">
              <li>What is the summary of the chart?</li>
              <li>
                <i>What is the case value of the United state?</i>
              </li>
              <li>
                <i>Which country has the lowest covid case?</i>
              </li>
              <li>
                <i>What is the average case in Asia?</i>
              </li>
              <li>
                <i>What is the total case of Europe?</i>
              </li>
            </ul>
            <Typography id="unsupported-questions" variant="h5" gutterBottom>
              Examples of unsupported questions
            </Typography>
            <ul aria-labelledby="unsupported-questions">
              <li>
                <i>"What countries are depicted in the chart?"</i> : This
                contextual question currently does not work but you may ask for
                the summary containing the same information.
              </li>
              <li>
                <i>"Are there more cases in the United States or in Canada?"</i>
                : This comparative query currently does not work as it requests
                multiple queries at once.
              </li>
              <li>
                <i>"What is the covid case of America?"</i>: This value lookup
                does not work as there are multiple countries in America.
                Instead, use the keyword "total" and ask{" "}
                <i>"what is the total covid case of America?</i>"
              </li>
            </ul>
            <p>{generateExplanation(defaults.triggers, SETTINGS)}</p>
          </div>
        );
      default:
        return;
    }
  }
  return (
    config && (
      <React.Fragment>
        <Container maxWidth="md" mt={5}>
          <Typography mt={3} variant="h3" ref={focusEl} tabIndex={-1}>
            Tutorial
          </Typography>
          {status === "preview" && (
            <p>
              In this tutorial, you learn a{" "}
              <strong>{renderMethodName(config)}</strong> method to engage with
              a chart. You first find an explanation on how to use the method
              and a tutorial chart made accessible with this method. When you
              click the button at the bottom of this page, practice questions
              will appear underneath the chart. Please take enough time to play
              with this tutorial to get familiar with the method.{" "}
              <strong>
                You should try to ask any lingering questions to the
                experimenter as you are not encouraged to do so in the main
                trial.
              </strong>
            </p>
          )}
          {status === "complete" && (
            <p>
              Now you are done with the tutorial. Please move to the mail trial.
            </p>
          )}
          {status === "question" && (
            <>
              <Typography ref={taskEl} tabIndex={-1} variant="h4" gutterBottom>
                How to Use {toTitleCase(renderMethodName(config))}
              </Typography>
              {renderExplanation(config)}
              <Typography variant="h4" gutterBottom>
                {toTitleCase(renderMethodName(config))}
              </Typography>
              {renderStimuli(config)}
            </>
          )}
          {status === "question" && (
            <Box mt={5} aria-live="polite">
              <Typography variant="h4">
                {`Task Question (${curQIdx + 1} of ${questions.length})`}
              </Typography>

              <Questionnaire
                ariaLive={"polite"}
                questions={currQuestion}
                onChange={handleResponse}
              />
            </Box>
          )}
          <Box p={3}>
            <Typography variant="subtitle1" color="error" aria-live="assertive">
              {error}
            </Typography>
          </Box>
          <Box mt={5} mb={5}>
            {status === "question" && (
              <Button variant="contained" fullWidth onClick={nextQuestion}>
                {curQIdx === questions.length - 1
                  ? "Complete Task"
                  : "Next Question"}
              </Button>
            )}
            {status === "preview" && (
              <Button variant="contained" fullWidth onClick={startPractice}>
                Start Practice Question
              </Button>
            )}
            {status === "complete" && (
              <Button
                variant="contained"
                fullWidth
                onClick={handleContinue}
                ref={btnEl}
                tabIndex={-1}
              >
                Move to Actual Trial
              </Button>
            )}
          </Box>
        </Container>
      </React.Fragment>
    )
  );
}

export default Tutorial;
