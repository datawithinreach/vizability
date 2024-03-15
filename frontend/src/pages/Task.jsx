import React, { useState, useContext, useRef, useEffect } from "react";
import { Box, Container, Typography, Button } from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import { SessionContext } from "../contexts/Session";

import Questionnaire from "../components/Questionaire.jsx";
import { taskQuestions } from "../charts/questions.js";


import BasicBar from "../components/BasicBar";
import BasicScatterPlot from "../components/BasicScatterPlot";
import BasicLine from "../components/BasicLine";
import BasicMap from "../components/BasicMap";

// import StructuredBar from "components/StructuredBar";
// import StructuredScatterPlot from "components/StructuredScatterPlot";
// import StructuredLine from "components/StructuredLine";
// import StructuredMap from "components/StructuredMap";

// import SpeechBar from "components/SpeechBar";
// import SpeechScatterPlot from "components/SpeechScatterPlot";
// import SpeechLine from "components/SpeechLine";
// import SpeechMap from "components/SpeechMap";

import toTitleCase from "../utils/toTitleCase.js";

function Task() {
  // const baseURL = process.env.PUBLIC_URL;
  const params = useParams();
  const navigate = useNavigate();
  //   console.log(params);
  const { setup, setTaskResponse, setLog } = useContext(SessionContext);
  console.log("setup", setup);
  const config = setup.length === 0 ? null : setup[params.stage];
  console.log("config", config);
  const [status, setStatus] = useState("preview");

  const questions = !config ? null : taskQuestions[config.chart];
  console.log("task questions", questions);

  const [curResp, setCurResp] = useState();
  const [responses, setResponses] = useState([]);
  const [curQIdx, setCurrQIdx] = useState(0);
  const [currQuestion, setCurrQuestion] = useState([]);

  const [startTime, setStartTime] = useState();
  const [error, setError] = useState("");

  const focusEl = useRef(null);
  const chartEl = useRef(null);
  const taskEl = useRef(null);
  const btnEl = useRef(null);

  useEffect(() => {
    // console.log("focus:", focusEl.current);
    if (focusEl.current) {
      focusEl.current.focus();
    }
  }, [config]);

  useEffect(() => {
    if (status === "question" && chartEl.current) {
      chartEl.current.focus();
    }
    if (status === "complete" && btnEl.current) {
      btnEl.current.focus();
    }
  }, [status]);

  useEffect(() => {
    if (curQIdx > 0 && taskEl.current) {
      taskEl.current.focus();
    }
  }, [curQIdx]);

  function nextQuestion() {
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
    if (
      curResp &&
      curResp.minimum &&
      curResp.response.replace(" ", "").length < curResp.minimum
    ) {
      setError(
        `Your response should be a minimum of 150 characters. Your response currently have ${
          curResp.response.replace(" ", "").length
        } characters.`
      );
      setTimeout(() => {
        setError("");
      }, "3000");
      return;
    }
    // const incorrect =
    //   !curResp ||
    //   [curResp].some((q) =>
    //     q.type === "checkbox"
    //       ? q.response.every((r) => !q.answer.includes(r))
    //       : q.response !== q.answer
    //   );
    // if (incorrect) {
    //   setError(
    //     "You have incorrect response. You need to choose the right answer in this tutorial before moving onto the actual task."
    //   );
    //   setTimeout(() => {
    //     setError("");
    //   }, "3000");
    //   return;
    // }
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
      console.log("move to next question, ", newIdx, [questions[newIdx]]);
      setCurrQIdx(newIdx);
      setCurrQuestion([questions[newIdx]]);
      setCurResp(null);
      // timer reset
      setStartTime(new Date().getTime());
    }
  }

  function startTask() {
    setStatus("question");
    console.log("startTask question", curQIdx, [questions[0]]);
    setCurrQIdx(0);
    setCurrQuestion([questions[0]]);
    // start timer
    console.log("start timing");
    setStartTime(new Date().getTime());
  }

  function handleResponse(responses) {
    const response = responses[0]; // save this
    console.log("response", response);
    setCurResp(response);
  }
  function handleContinue() {
    setTaskResponse(responses, params.stage);
    navigate(`/VizAbility/data/tasksurvey/${params.stage}`);
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
  function handleLog(name, data, datetime) {
    setLog({
      stage: params.stage,
      chart: config.chart,
      method: config.method,
      name,
      data,
      datetime,
    });
  }
  function renderStimuli(config) {
    switch (config.method) {
      case "table":
        switch (config.chart) {
          case "bar":
            return <BasicBar onLog={handleLog} />;
          case "line":
            return <BasicLine onLog={handleLog} />;
          case "scatter":
            return <BasicScatterPlot onLog={handleLog} />;
          case "map":
            return <BasicMap onLog={handleLog} />;
          default:
            return;
        }
    //   case "structured":
    //     switch (config.chart) {
    //       case "bar":
    //         return <StructuredBar onLog={handleLog} />;
    //       case "line":
    //         return <StructuredLine onLog={handleLog} />;
    //       case "scatter":
    //         return <StructuredScatterPlot onLog={handleLog} />;
    //       case "map":
    //         return <StructuredMap onLog={handleLog} />;
    //       default:
    //         return;
    //     }
    //   case "speech":
    //     switch (config.chart) {
    //       case "bar":
    //         return <SpeechBar onLog={handleLog} />;
    //       case "line":
    //         return <SpeechLine onLog={handleLog} />;
    //       case "scatter":
    //         return <SpeechScatterPlot onLog={handleLog} />;
    //       case "map":
    //         return <SpeechMap onLog={handleLog} />;
    //       default:
    //         return;
    //     }
      default:
        return;
    }
  }

  return (
    config && (
      <React.Fragment>
        <Container maxWidth="md" mt={5}>
          <Typography mt={3} variant="h3" ref={focusEl} tabIndex={-1}>
            Main Trial
          </Typography>
          {status === "preview" && (
            <p>
              Next, we want to test the functionality of this{" "}
              <strong>{renderMethodName(config)}</strong> method. Below, we
              present a different chart. We will ask you a number of task
              questions one by one. Please use the method to find answers to the
              questions as fast and accurately as possible. If you get stuck or
              take too long, choose the answer option that you feel is most
              accurate and move on. Once you hit the "start task question"
              button below to start the main trial, we will start timing your
              responses.{" "}
              <strong>
                You are encouraged to find all answers on your own but may ask
                for help from the experimenter if necessary.
              </strong>
              The experimenter will intervene if there is any technical
              difficulty.
            </p>
          )}
          {status === "complete" && (
            <p>
              You are done with the {toTitleCase(renderMethodName(config))}{" "}
              condition. Please move to the next stage.
            </p>
          )}
          {status === "question" && (
            <React.Fragment>
              <Typography variant="h4" gutterBottom ref={chartEl} tabIndex={-1}>
                {toTitleCase(renderMethodName(config))}
              </Typography>
              {renderStimuli(config)}
              <Box mt={5} aria-live="polite">
                <Typography
                  variant="h4"
                  gutterBottom
                  ref={taskEl}
                  tabIndex={-1}
                >
                  {`Task Question (${curQIdx + 1} of ${questions.length})`}
                </Typography>

                <Questionnaire
                  ariaLive={"polite"}
                  questions={currQuestion}
                  onChange={handleResponse}
                />
              </Box>
            </React.Fragment>
          )}
          <Box p={3}>
            <Typography variant="subtitle1" color="error" aria-live="polite">
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
              <Button variant="contained" fullWidth onClick={startTask}>
                Start Task Question
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
                Move to Post Task Survey
              </Button>
            )}
          </Box>
        </Container>
      </React.Fragment>
    )
  );
}

export default Task;
