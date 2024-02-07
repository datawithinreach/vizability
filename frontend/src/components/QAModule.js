import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const QAModule = ({suggestedQuestions, handleQuestionSubmit}) => {

    return (
        <div>
            {suggestedQuestions.map((question, i) => {
                return <Button onClick={()=> handleQuestionSubmit(question)} key={"question" + i}>{question}</Button>
            })}
            <Form onSubmit={(event) => {
                event.preventDefault()
                handleQuestionSubmit(event.target.question.value)
            } }>
                <Form.Group className="mb-3">
                    <Form.Control name= "question" type="text" placeholder="Enter question here" />
                    <Form.Text className="text-muted">
                    later
                    </Form.Text>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    )
}

export default QAModule;