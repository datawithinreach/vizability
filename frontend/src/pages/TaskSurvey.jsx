import React, { useState, useContext,  useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
} from "@mui/material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { SessionContext } from "../contexts/Session";

import Questionnaire from "../components/Questionaire";

function TaskSurvey() {
  const navigate = useNavigate();
  // const baseURL = process.env.PUBLIC_URL;
  const params = useParams();
  //   console.log(params);
  const { setup, setTaskSurveyResponse } = useContext(SessionContext);
  const config = setup.length === 0 ? null : setup[params.stage];
  console.log("config", config);
  const focusEl = useRef(null);
  useEffect(()=>{
    focusEl.current.focus();
  },[])
  function handleContinue(e) {
    const incomplete = questions.some((q) =>
      q.type === "checkbox"
        ? q.response.every((r) => r === false)
        : q.response === ""
    );

    console.log("moving ", incomplete, forceContinue);
    if (incomplete && !forceContinue) {
      setError("You have unanswered questions.");
      setForceContinue(true);
      return;
    }
    setTimeout(function () {
      setError("");
    }, 5000);

    console.log(
      "successfully saving the background survey response",
      questions
    );
    setTaskSurveyResponse(questions, params.stage);

    navigate("/VizAbility/data/postsurvey");

    // if (params.stage == 2) {
    //   navigate("/postsurvey");
    // } else {
    //   navigate(`/tutorial/${parseInt(params.stage) + 1}`);
    // }
  }
  function renderMethodName(config) {
    switch (config.method) {
      case "table":
        return "data table";
      case "structured":
        return "structured navigation";
      case "speech":
        return "speech interaction";
      default:
        return "";
    }
  }
  // console.log(PID);
  // const baseURL = process.env.PUBLIC_URL;
  const [forceContinue, setForceContinue] = useState(false);
  const [error, setError] = useState(""); // to show an error message
  const [questions, setQuestions] = useState([
    {
      prompt: "How enjoyable was it to interact with the data? ",
      type: "radiogroup",
      response: "",
      options: [
        "Very unenjoyable",
        "Somewhat unenjoyable",
        "Neutral",
        "Somewhat enjoyable",
        "Very enjoyable",
      ],
    },
    {
      prompt: "If you already knew what information you were trying to find, how easy would it be to look up or locate those data?",
      type: "radiogroup",
      response: "",
      options: [
        "Very difficult",
        "Somewhat difficult",
        "Neutral",
        "Somewhat easy",
        "Very easy",
      ],
    },
    {
        prompt: "If you didn’t already know which information you were trying to find, how easy would it be to browse or explore the data?",
        type: "radiogroup",
        response: "",
        options: [
          "Very difficult",
          "Somewhat difficult",
          "Neutral",
          "Somewhat easy",
          "Very easy",
        ],
      },
      {
          prompt: "How easy was it to learn to use?",
          type: "radiogroup",
          response: "",
          options: [
            "Very difficult",
            "Somewhat difficult",
            "Neutral",
            "Somewhat easy",
            "Very easy",
          ],
        },
        {
            prompt: "How useful would it be to have access to this interaction style for engaging with data?",
            type: "radiogroup",
            response: "",
            options: [
              "Very unuseful",
              "Somewhat unuseful",
              "Neutral",
              "Somewhat useful",
              "Very useful",
            ],
          },
          {
            prompt: "How sure where you that your answers were correct?",
            type: "radiogroup",
            response: "",
            options: [
              "Very unsure",
              "Somewhat unsure",
              "Neutral",
              "Somewhat sure",
              "Very sure",
            ],
          },
      
  ]);

  function handleChange(questions) {
    console.log("questions", questions);
    setQuestions(questions);
  }

  return (
    <React.Fragment>
      {/* {PID === '' && <Navigate to={baseURL} replace={true} />} */}
      <Container maxWidth="md" mt={5}>
        <Typography mt={3} variant="h3"   ref={focusEl} tabIndex={-1} >
          Post Task Survey
        </Typography>
        <p>
        You have completed all tasks for this method. Now, please rate your experience by answering questions in the following survey.
        </p>
        <Questionnaire questions={questions} onChange={handleChange} />
        <Box p={3}>
          <Typography variant="subtitle1" color="error" aria-live="assertive">
            {error}
          </Typography>
        </Box>
        <Box mb={5}>
          <Button variant="contained" fullWidth onClick={handleContinue}>
            Next
          </Button>
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default TaskSurvey;
