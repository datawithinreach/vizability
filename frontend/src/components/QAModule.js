import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';

const QAModule = ({answerToQuestion, classificationExplanation, 
    isLoadingAnswer, suggestedQuestions, handleQuestionSubmit, revisedQuestion}) => {

    return (
        <div>
            <Row>
                {/* <Button onClick=></Row>>Generate New Questions</Button> */}
                {suggestedQuestions.map((question, i) => {
                    return <Button variant="outline-secondary" onClick={()=> handleQuestionSubmit(question)} key={"question" + i}>{question}</Button>
                })}
            </Row>
            <Form onSubmit={(event) => {
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
                    <Button variant="outline-secondary">Record</Button>
                </InputGroup>
            </Form>
            <Row>
                {isLoadingAnswer && <p>Working, please wait!</p>}
            </Row>
            {!isLoadingAnswer && classificationExplanation && answerToQuestion &&
            <Row>  
                <h4>Response: </h4>
                <p>Question: {classificationExplanation}</p>
                <p>Revised Question: {revisedQuestion}</p>
                <p>Answer: {answerToQuestion}</p>
            </Row>
            }

           
    
        </div>
    )
}

export default QAModule;