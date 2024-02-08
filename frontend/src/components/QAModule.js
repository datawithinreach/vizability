import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';

const QAModule = ({suggestedQuestions, handleQuestionSubmit}) => {

    return (
        <div>
            <Row>
                {suggestedQuestions.map((question, i) => {
                    return <Button variant="outline-secondary" onClick={()=> handleQuestionSubmit(question)} key={"question" + i}>{question}</Button>
                })}
            </Row>
            <Form onSubmit={(event) => {
                event.preventDefault()
                handleQuestionSubmit(event.target.question.value)
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
    
        </div>
    )
}

export default QAModule;