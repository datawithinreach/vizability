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
  const [graphDescription, setGraphDescription] = useState("")
  const [axesInfo, setAxesInfo] = useState("Axes info")

  const typeDescriptions = {
    chart1: "A line chart",
    chart2: "A bar chart",
    chart3: "A scatter plot",
    chart4: "A geographic map",
}

  async function getGraphData() {
    /**
     * Fetch the data from the backend based on what type of graph was selected and updates the states accordingly.
     * @param graphType A string that can only be "chart1", "chart2", "chart3", or "chart4"
     */
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=./test/testVegaLiteSpecs/" + graphType + ".vg");
    const data = await response.json(); // this is a string
    const dataObj = JSON.parse(data.contents); // convert to json obj
    setGraphSpec(dataObj);
    console.log(dataObj)

    // structure the olli description based on the graph type
    if (graphType === "chart4") { //choropleth is special (color and detail instead of xy)
        setGraphDescription(`${dataObj.description ? dataObj.description + '.': ''} ${typeDescriptions[graphType]}: ${dataObj.encoding.color.field} and ${dataObj.encoding.detail.field}.`)
    } else {
        setGraphDescription(`${dataObj.description ? dataObj.description + '.': ''} ${typeDescriptions[graphType]} with axes: ${dataObj.encoding.x.title ? dataObj.encoding.x.title : dataObj.encoding.x.field } and ${dataObj.encoding.y.title ? dataObj.encoding.y.title : dataObj.encoding.y.field}.`)

        // setAxesInfo(`X-axes titled ${dataObj.encoding.x.field} for a ${dataObj.encoding.x.type} scale with  `)
    }
  }

  // grab new data every time a new chart is selected
  useEffect(()=> {
    if (graphType) {
      getGraphData(); }
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

      
      {graphType && <GraphQA graphSpec = {graphSpec} axesInfo={axesInfo} graphDescription = {graphDescription}/>}

  </div>
  );
};

export default HomePage;