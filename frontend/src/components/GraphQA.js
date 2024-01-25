import React, {useEffect, useState} from "react";

// import { Vega } from 'react-vega'

// import { createClassFromSpec } from "react-vega";
// import { VegaGragh } from "./VegaGragh";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';


import { VegaLite } from 'react-vega'

const GraphQA = ({graphType}) => {

    const [graphSpec, setGraphSpec] = useState(false)
    const [showOlli, setShowOlli] = useState(false)

    const [graphDescription, setGraphDescription] = useState('')

    const typeDescriptions = {
        chart1: "A line chart",
        chart2: "A bar chart",
        chart3: "A scatter plot",
        chart4: "A geographic map",
    }

    async function getGraphData(graphType) {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=./test/testVegaLiteSpecs/" + graphType + ".vg");
        const data = await response.json();
        const dataObj = JSON.parse(data.contents);
        setGraphSpec(dataObj);
        if (graphType === "chart4") { //choropleth is special (color and detail instead of xy)
            setGraphDescription(`${dataObj.description ? dataObj.description + '.': ''} ${typeDescriptions[graphType]}: ${dataObj.encoding.color.field} and ${dataObj.encoding.detail.field}.`)
        } else {
            setGraphDescription(`${dataObj.description ? dataObj.description + '.': ''} ${typeDescriptions[graphType]} with axes: ${dataObj.encoding.x.title ? dataObj.encoding.x.title : dataObj.encoding.x.field } and ${dataObj.encoding.y.title ? dataObj.encoding.y.title : dataObj.encoding.y.field}.`)
        }

    }

    // graph new data whenever graphType changes
    useEffect(() => {
        getGraphData(graphType);
    }, [graphType])


    return (
        <div>
            <p>{graphType} </p>

            <Row>{graphSpec && <VegaLite spec={graphSpec} />}</Row>

            {/* <Row>  */}
            <Button variant="outline-secondary" onClick={() => {
                setShowOlli(!showOlli);
            }}>Toggle Olli</Button>
            <Button variant="outline-success">Toggle Table</Button>

            {/* </Row> */}

            {showOlli && <div> 
                <b>Explore the structure and components of the chart through a text representation. Instructions: Press enter on the treeview to explore the contents of the chart. Navigate using the arrows keys. To exit, press escape.</b> 
                <p>{graphDescription}</p>
            </div>}

        </div>
    );
};

export default GraphQA;