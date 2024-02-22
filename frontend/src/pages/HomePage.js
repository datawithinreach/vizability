import React, {useState, useEffect} from "react";
import "../styles/HomePageStyle.css"
import GraphQA from "../components/GraphQA";
// import loadingLogo from "../images/loadingLogo1.gif"


import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import { processFile, loadVGandSendToBackend } from "../utils/helperFuncs";

const HomePage = () => {
  const [graphType, setGraphType] = useState('');
  const [graphSpec, setGraphSpec] = useState(false)


  async function getGraphData() {
    /**
     * Fetch the data from the backend based on what type of graph was selected and updates the states accordingly.
     * @param graphType A string that can only be "chart1", "chart2", "chart3", or "chart4"
     */
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=./test/testVegaLiteSpecs/" + graphType + ".vg");
    const data = await response.json(); // this is a string
    const dataObj = JSON.parse(data.contents); // convert to json obj
    setGraphSpec(dataObj);
  }

  // grab new data every time a new chart is selected
  useEffect(()=> {
    if (graphType && graphType !== "custom") {
      getGraphData(); 
    }
  }, [graphType])

  // useEffect(()=> {
  //   const chart = document.getElementsByClassName("chart-wrapper"); // ! might need to change if vega lite change their classname
  //   if (graphType && chart.length < 1) {
  //     setIsLoading(true);
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, [graphSpec])

  async function handleFileSubmit (event) {
    const vegaLiteInfo = await processFile(event.target.files);
    try {
      if (vegaLiteInfo) {
        console.log('in submit')
        loadVGandSendToBackend(vegaLiteInfo);
        setGraphSpec(JSON.parse(vegaLiteInfo["contents"]));
        setGraphType('custom');
     }
    } catch (error) {
      console.log('error', error)
    }
   
  }


  return (
    <div className="qa-page">
      <h1 className="title"> Data Visualization</h1>
      <Container className="direction-section">
        <h4>Load in a chart by selecting one of the four options or upload your own file.<br/> Explore the structure and
        components of the chart through a text representation. <br/>Supplement your knowledge of the chart by asking
        questions, either through typing or voice input. </h4>
      </Container>

      <Container>
        <Row className="files-upload-section">
          <Col xs={8} className="justify-content-md-center">
            <Row className="add-margin">
              <Col>
               <Button className="chart-buttons" variant="outline-secondary" size="lg" onClick={() => {setGraphType("chart1")}}> Line Chart </Button>
              </Col>
             <Col>
              <Button className="chart-buttons" variant="outline-secondary" size="lg" onClick={() => {setGraphType("chart2")}}> Bar Chart </Button>
             </Col>
            </Row>

            <Row className="add-margin">
              <Col>
                <Button className="chart-buttons" variant="outline-secondary" size="lg" onClick={() => {setGraphType("chart3")}}> Scatter Plot </Button>
              </Col>
              <Col>
                <Button className="chart-buttons" variant="outline-secondary" size="lg" onClick={() => {setGraphType("chart4")}}> Choropleth Map </Button>
              </Col>
            </Row>
          </Col>
          
          <Col>
            <Form.Group onChange= {handleFileSubmit} controlId="formFile" className="mb-3">
              <Form.Label>Upload Local File</Form.Label>
              <Form.Control type="file" accept=".json, .vg"/>
            </Form.Group>
          </Col>
        </Row>

      </Container>

      {graphType && <p>Graph selected.</p>}
      {graphSpec && <GraphQA graphSpec = {graphSpec} setGraphSpec = {setGraphSpec} />}

  </div>
  );
};

export default HomePage;