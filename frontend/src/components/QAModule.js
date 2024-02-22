import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';
import AudioRecorder from './AudioRecorder';
import "../styles/QAModule.css"


const QAModule = ({userQuestion, answerToQuestion, classificationExplanation, 
    isLoadingAnswer, suggestedQuestions, handleQuestionSubmit, revisedQuestion}) => {
    
    return (
        <Container>
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
                {isLoadingAnswer && <p>Working on question: {userQuestion}, please wait!</p>}
            </Row>
            {!isLoadingAnswer && classificationExplanation && answerToQuestion &&
            <Row>  
                <h4>Response: </h4>
                <p>Question: {classificationExplanation}</p>
                <p>Revised Question: {revisedQuestion}</p>
                <p>Answer: {answerToQuestion}</p>
            </Row>
            }

           
    
        </Container>
    )
}

export default QAModule;