import React, { useEffect, useRef, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { SessionContext } from "../contexts/Session";
// import CommentQuestion from "components/CommentQuestion";
// import CheckboxQuestion from "components/CheckboxQuestion";
// import RadioGroupQuestion from "components/RadioGroupQuestion";
// import Questionnaire from "components/Questionnaire";

function Main() {
  const navigate = useNavigate();
  const { setStart } = useContext(SessionContext);
  function handleContinue(e) {
    setStart();
    navigate("/VizAbility/data/tutorial/0");
  }
  const focusEl = useRef(null);
  useEffect(() => {
    focusEl.current.focus();
    console.log("focus");
  }, [focusEl.current]);
  return (
    <React.Fragment>
      {/* {PID === '' && <Navigate to={baseURL} replace={true} />} */}
      <Container maxWidth="md" mt={5}>
        <Typography mt={3} variant="h3" ref={focusEl} tabIndex={-1}>
          Main Study
        </Typography>
        <p>
          Let's begin the main part of the study. You will be presented with
          three different methods for making charts accessible. For each method,
          you will have a tutorial to familiarize yourself with the method. You
          will be then asked to use it to answer some questions.
        </p>
        <p>
          Please keep in mind that some of these methods are experimental. Thus,
          they still have limitations. When giving your answers, please do your
          best but remember that we are not judging your performance. We want to
          see how well each method supports you in finding your answers. This
          study is part of an ongoing investigation to find a better solution
          for making charts more accessible.
        </p>
        <p>
          Please click the start button at the bottom of the page to begin the
          main tasks.
        </p>
        <Box mb={5}>
          <Button variant="contained" fullWidth onClick={handleContinue}>
            Start Main Tasks
          </Button>
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default Main;
