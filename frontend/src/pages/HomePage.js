import React, {useState} from "react";
import "../styles/HomePageStyle.css"
import GraphQA from "../components/GraphQA";


import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import Container from 'react-bootstrap/Container';


const HomePage = () => {
  const [graphType, setGraphType] = useState('');
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

      
      {graphType && <GraphQA graphType = {graphType} />}

  </div>
  );
};

export default HomePage;