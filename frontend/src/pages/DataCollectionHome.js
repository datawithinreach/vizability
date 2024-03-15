import React, { useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
// import { SessionContext } from "contexts/Session";

function DataCollectionHome() {
  const navigate = useNavigate();
  const focusEl = useRef(null);

  function handleContinue(){
    console.log('navifate to consent')
    navigate("/VizAbility/data/informedconsent", { replace: true });
  }

  useEffect(()=>{
    focusEl.current.focus();
  },[])

  return (
      <Container maxWidth="md" m={5}>
        <Typography mt={3} variant="h3" gutterBottom ref={focusEl} tabIndex={-1}>
          User Study on Ways to Make Charts Accessible
        </Typography>
        <p>
          Welcome!
        </p>
        <p>Please make sure that you are in a quiet environment with no distractions. </p>
        <p>Close any unnecessary tabs or programs on your computer. </p>
        <p>Use your screen reader software that you are most comfortable with.</p>        
        <p>When you are ready, please click the "continue" button below to continue.</p>
        <Box mt={5}>
          

          <Box mt={5}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleContinue}
            >
              Continue
            </Button>
          </Box>
        </Box>

      </Container>
  );
}

export default DataCollectionHome;
