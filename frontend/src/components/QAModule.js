import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';
import AudioRecorder from './AudioRecorder';
import "../styles/QAModule.css"

import { useState, useEffect } from 'react';


const QAModule = ({userQuestion, answerToQuestion, classificationExplanation, 
    isLoadingAnswer, suggestedQuestions, handleQuestionSubmit, revisedQuestion}) => {

    const [waitingStatus, setWaitingStatus] = useState(`Please wait! Working on question: ${userQuestion}.`);
        
    useEffect(() => {
        //Implementing the setInterval method
        if (isLoadingAnswer) {
            const interval = setInterval(() => {
                setWaitingStatus("Still Loading.")
            }, 4000);

            //Clearing the interval
            return () => clearInterval(interval);
        } else {
            setWaitingStatus(`Please wait! Working on question: ${userQuestion}.`)
        }
 
    }, [isLoadingAnswer]);
    
    return (
        <Container aria-live="polite">
            <Row>
                <b>Supplement your knowledge of the chart by asking questions, either through typing or voice input.</b>
            </Row>
            <Row>
                {/* <Button onClick=></Row>>Generate New Questions</Button> */}
                {suggestedQuestions.map((question, i) => {
                    return <Button className='suggestion-buttons' variant="outline-secondary" onClick={()=> handleQuestionSubmit(question)} key={"question" + i}>{question}</Button>
                })}
            </Row>
            <Form className="question-form" onSubmit={(event) => {
                event.preventDefault()
                handleQuestionSubmit(event.target.question.value)
                // reset value
                event.target.question.value = '';
            } }>
                <InputGroup>
                    <Form.Control
                    name= "question" 
                    placeholder="Type your question here."
                    />
                    <Button type = "submit" variant="outline-secondary">Submit</Button>
                    <AudioRecorder handleQuestionSubmit = {handleQuestionSubmit}/>
                    {/* <Button variant="outline-secondary">Record</Button> */}
                </InputGroup>
            </Form>
            <Row>
                {isLoadingAnswer && <p> {waitingStatus} </p>}
            </Row>
            {!isLoadingAnswer && classificationExplanation && answerToQuestion &&
            <Row className='response-section'>  
                <h3> Generated Response: </h3>
                <p> <b>Question:</b> {classificationExplanation}</p>
                <p> <b>Revised Question: </b> {revisedQuestion}</p>
                <p> <b>Answer: </b> {answerToQuestion}</p>
            </Row>
            }

           
    
        </Container>
    )
}

export default QAModule;