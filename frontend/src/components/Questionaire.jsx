import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";

import CommentQuestion from "./CommentQuestion";
import CheckboxQuestion from "./CheckboxQuestion";
import RadioGroupQuestion from "./RadioGroupQuestion";

function Questionnaire(props) {
  const [questions, setQuestions] = useState(props.questions);
  
  useEffect(() => {
    setQuestions(props.questions);
  }, [props.questions]);
  
  function handleCheckboxChange(questionIndex, optionIndex, checked) {
    const newQuestions = questions.map((q, i) => {
      if (i !== questionIndex) {
        return q;
      }
      return {
        ...q,
        response: q.response.map((r, j) => {
          if (j !== optionIndex) {
            return r;
          }
          return checked;
        }),
      };
    });
    setQuestions(newQuestions);
    if (props.onChange) {
      props.onChange(newQuestions);
    }
  }
  function handleRadioGroupChange(questionIndex, response) {
    const newQuestions = questions.map((q, i) => {
      if (i !== questionIndex) {
        return q;
      }
      return {
        ...q,
        response,
      };
    });
    setQuestions(newQuestions);
    if (props.onChange) {
      props.onChange(newQuestions);
    }
  }
  function handleCommentChange(questionIndex, response) {
    const newQuestions = questions.map((q, i) => {
      if (i !== questionIndex) {
        return q;
      }
      return {
        ...q,
        response,
      };
    });
    setQuestions(newQuestions);
    if (props.onChange) {
      props.onChange(newQuestions);
    }
  }

  return (
    <Box aria-live={props.ariaLive}>
      {questions.map((q, i) => {
        switch (q.type) {
          case "comment":
            return (
              <CommentQuestion
                key={i}
                prompt={q.prompt}
                description={q.description}
                response={q.response}
                options={q.options}
                onChange={handleCommentChange.bind(this, i)}
              />
            );

          case "checkbox":
            return (
              <CheckboxQuestion
                key={i}
                prompt={q.prompt}
                description={q.description}
                options={q.options}
                response={q.response}
                onChange={handleCheckboxChange.bind(this, i)}
              />
            );
          case "radiogroup":
            return (
              <RadioGroupQuestion
                key={i}
                prompt={q.prompt}
                description={q.description}
                options={q.options}
                response={q.response}
                onChange={handleRadioGroupChange.bind(this, i)}
              />
            );
          default:
            break;
        }
      })}
    </Box>
  );
}

export default Questionnaire;
