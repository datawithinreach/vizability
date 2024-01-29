import React, {useState, useEffect} from "react";
import "../styles/HomePageStyle.css"
import GraphQA from "../components/GraphQA";


import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import Container from 'react-bootstrap/Container';


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
    // console.log(dataObj)

  }

  // grab new data every time a new chart is selected
  useEffect(()=> {
    if (graphType) {
      getGraphData(); 
    }
  }, [graphType])

  return (
    <div className="content">
      <h1 className="title">VizAbility - Data Visualization</h1>
      <h2>Load in a chart by selecting one of the four options or upload your own file.<br/> Explore the structure and
      components of the chart through a text representation. <br/>Supplement your knowledge of the chart by asking
      questions, either through typing or voice input. </h2>


      <Container>
      <Row className="justify-content-md-center">
        <Col> <Button size="lg" onClick={() => {setGraphType("chart1")}}> Line Chart </Button> </Col>
        <Col> <Button size="lg" onClick={() => {setGraphType("chart2")}}> Bar Chart </Button> </Col>
        <Col> <Button size="lg" onClick={() => {setGraphType("chart3")}}> Scatter Plot </Button> </Col>
        <Col> <Button size="lg" onClick={() => {setGraphType("chart4")}}> Choropleth Map </Button> </Col>
      </Row>
      </Container>

      
      {graphType && <GraphQA graphSpec = {graphSpec} graphType = {graphType}/>}

  </div>
  );
};

export default HomePage;