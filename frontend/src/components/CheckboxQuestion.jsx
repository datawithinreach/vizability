import React from "react";

import {
  Typography,
  FormGroup,
  Checkbox,
  Box,
  FormLabel,
} from "@mui/material";

function CheckboxQuestion(props) {
  function handleChange(optionIndex, event) {
    if (props.onChange) {
      console.log(
        "optionIndex, event.target.checked",
        optionIndex,
        event.target.checked
      );
      props.onChange(optionIndex, event.target.checked);
    }
  }
  return (
    <Box pt={3}>
      <FormLabel id={props.prompt.trim().replace(/\s+/g, "-")}>
        <Typography variant="h6" gutterBottom>
          {props.prompt}
        </Typography>
      </FormLabel>
      {props.description&&<Typography variant="body2" gutterBottom>{props.description}</Typography>}
      <Box ml={2}>
        <FormGroup aria-labelledby={props.prompt.trim().replace(/\s+/g, "-")}>
          {props.options.map((option, i) => (
            <div key={i} sx={{display:"flex"}}>
                 <Checkbox
                  checked={props.response[i]}
                  onChange={handleChange.bind(this, i)}
                  name={option}
                />
                <span aria-hidden="true">{option}</span>
            </div>
          ))}
        </FormGroup>
      </Box>
    </Box>
  );
}

export default CheckboxQuestion;
