import React from "react";
import { Typography, RadioGroup, Radio,
     FormControl, FormLabel, Box} from "@mui/material"
function RadioGroupQuestion(props) {

    function handleChange(e) {
        if (props.onChange) {
            props.onChange(e.target.value);
        }

    }
    return (
        <Box pt={3}>
            <FormControl>
                <FormLabel id={props.prompt.trim().replace(/\s+/g, '-')}>
                    <Typography variant="h6" gutterBottom>
                        {props.prompt}
                    </Typography>
                </FormLabel>
                {props.description && <Typography variant="body2" gutterBottom>{props.description}</Typography>}
                <Box ml={2}>
                    <RadioGroup
                        // aria-labelledby={props.prompt.trim().replace(/\s+/g, '-')}
                        name={props.prompt}
                        value={props.response}
                        onChange={handleChange}
                    >

                        {props.options.map((option, i) =>
                            <div key={i} >
                                <Radio value={option} label={option} 
                                name={props.prompt}
                                inputProps={{
                                    'aria-label': option,
                                }} />
                                <span aria-hidden="true">{option}</span>
                            </div>

                        )}

                    </RadioGroup>
                </Box>

            </FormControl>
        </Box >
    );
}

export default RadioGroupQuestion;