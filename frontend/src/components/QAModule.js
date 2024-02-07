import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const QAModule = () => {
    const handleQuestionSubmit = (event) => {
        // prevent the page from refreshing when user submit their question
        event.preventDefault();
        const userQuestion = event.target.question.value;

    }
    return (
        <div>
            <Form onSubmit={handleQuestionSubmit}>
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