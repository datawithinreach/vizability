import React, { useState, useContext,  useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { SessionContext } from "../contexts/Session";

import Questionnaire from "../components/Questionaire";

function Presurvey() {
  const navigate = useNavigate();
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
    setBackground(questions);
    navigate("/VizAbility/data/main");
  }
  const focusEl = useRef(null);
  useEffect(()=>{
    focusEl.current.focus();
  },[])

  const { PID, setBackground } = useContext(SessionContext);
  // console.log(PID);
  // const baseURL = process.env.PUBLIC_URL;
  const [forceContinue, setForceContinue] = useState(false);
  const [error, setError] = useState(""); // to show an error message
  const [questions, setQuestions] = useState([
    {
      prompt: "What is your gender?",
      type: "radiogroup",
      response: "",
      options: [
        "Non-binary",
        "Female",
        "Male",
        "Other",
        "Prefer not to answer"
      ],
    },
    {
      prompt: "What is your age?",
      type: "radiogroup",
      response: "",
      options: [
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65 or older",
        "Prefer not to answer"
      ],
    },
    {
      prompt: "Which one of the following best describes your level of vision?",
      type: "radiogroup",
      response: "",
      options: [
        "Blind since birth",
        "Blind with later onset",
        "Low vision since birth",
        "Low vision with later onset",
        "Other",
      ],
    },
    // {
    //   prompt: "Question 2",
    //   type: "checkbox",
    //   response: [false, false, false, false, false],
    //   options: ["Option1", "Option2", "Option3", "Option4", "Option5"],
    // },
    {
      prompt:
        "Did you receive a formal diagnosis of your level of vision?  If yes, please type in the name of the diagnosis. Otherwise, type in \"no\".",
      type: "comment",
      response: "",
    },
    {
      prompt:
        "When it comes to using a screen reader, how would you rate your level of experience?",
      type: "radiogroup",
      response: "",
      options: [
        "Basic, I am a novice screen reader user.",
        "Intermediate, I know the basics of using a screen reader and use it from time to time.",
        "Advanced, I have a good knowledge of how to use a screen reader and use it almost daily.",
        "Expert, I can confidently use a screen reader even for complex tasks.",
      ],
    },
    {
      prompt: "Which screen reader are you using right now?",
      type: "radiogroup",
      response: "",
      options: ["JAWS", "NVDA", "VoiceOver", "ZoomText/Fusion", "Narrator", "Other"],
    },
    {
      prompt: "Which browser are you using right now?",
      type: "radiogroup",
      response:"",
      options: ["Chrome", "Microsoft Edge", "Firefox", "Safari", "Internet Explorer", "Other"]
    },
    {
      prompt:
        "What is your level of experience when it comes to interacting with, making, or reading data tables?",
      type: "radiogroup",
      response: "",
      options: [
        "No to little experience. I barely ever engage with data tables.",
        "Basic. I know what data tables are and how they are constructed. ",
        "Intermediate. I can efficiently navigate and understand data tables.",
        "Advanced. I can use or create data tables to perform statistical data analysis.",
      ],
    },

    {
      prompt:
        "What is your level of experience when it comes to interacting with, making, or reading charts?",
      type: "radiogroup",
      response: "",
      options: [
        "No to little experience. I barely ever engage with charts.",
        "Basic. I know what charts are and how they are constructed.",
        "Intermediate. I can effectively navigate and understand charts ",
        "Advanced.  I can use or create charts to analyze and communicate data.",
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
        <Typography mt={3} variant="h3"  ref={focusEl} tabIndex={-1} gutterBottom>
          Background Survey
        </Typography>
        <p>In this survey, we would like to ask a few questions to understand your background better, including your vision condition and prior experience with screen readers, data tables, and charts.</p>
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

export default Presurvey;
