import React, { useEffect, useRef } from "react";
import { Box, Container, Typography, Button, Link } from "@mui/material";

import {useNavigate } from "react-router-dom";

function InformedConsent() {
  // const baseURL = process.env.PUBLIC_URL;
  const navigate = useNavigate();

  function handleContinue(event) {
    navigate("/ready");
  }
  const focusEl = useRef(null);
  useEffect(()=>{
    console.log("setting new focus to header", focusEl.current);
    focusEl.current.focus();
  },[])
  return <Container maxWidth="md" m={5}>
    <Typography mt={3} variant="h3" ref={focusEl} tabIndex="-1">
      Informed Consent
    </Typography>
    <p>
      You have received an {" "}
      <Link
        href="https://docs.google.com/document/d/18jg4W-vlBGZIYHEaB7RbGshOzr_V4eN_tJe1NtjFwEo/edit?usp=sharing"
        target="_blank"
      >
        information sheet
      </Link>{" "}
      containing all information about this study. You were asked to go through
      this information in advance or you can go through it now if you have not
      done so already. Please ask any open questions now.
    </p>
    <p>
      If there are no further questions, please click the button below to confirm that you received and understood the study information, that you agree to participate in this study, and that your session will be recorded.
    </p>
    <Box mt={5}>
      <Button
        variant="contained"
        fullWidth
        onClick={handleContinue}
      >
        I agree to participate
      </Button>
    </Box>
  </Container>;
}

export default InformedConsent;
