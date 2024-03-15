import React from "react";
import { FormControl, Typography, TextField, Box, FormLabel } from "@mui/material"

function CommentQuestion(props) {

    function handleChange(e) {
        if (props.onChange) {
            props.onChange(e.target.value);
        }

    }
    return (
        <Box pt={3}>
            <FormControl >
                <FormLabel id={props.prompt.trim().replace(/\s+/g, '-')}>
                    <Typography variant="h6" gutterBottom>
                        {props.prompt}
                    </Typography>
                </FormLabel>
                {props.description&&<Typography variant="body2" gutterBottom>{props.description}</Typography>}
                <TextField  label= "Type your answer here"  value={props.response} onChange={handleChange} />


            </FormControl>
        </Box>
    );
}

export default CommentQuestion;