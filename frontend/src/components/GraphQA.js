import React, {useEffect, useState} from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import "../styles/GraphQAStyle.css"

import { VegaLite } from 'react-vega'

const GraphQA = ({graphType}) => {

    const [graphSpec, setGraphSpec] = useState(false)
    const [showOlli, setShowOlli] = useState(false)
    const [graphDescription, setGraphDescription] = useState("")

    const [showAxesInfo, setShowAxesInfo] = useState(false)
    const [axesInfo, setAxesInfo] = useState("Axes info")



    const typeDescriptions = {
        chart1: "A line chart",
        chart2: "A bar chart",
        chart3: "A scatter plot",
        chart4: "A geographic map",
    }

    async function getGraphData(graphType) {
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

    // graph new data whenever graphType changes
    useEffect(() => {
        getGraphData(graphType);
    }, [graphType])


    return (
        <div>
            <Row>{graphSpec && <VegaLite spec={graphSpec} />}</Row>

            {/* <Row>  */}
            <Button variant="outline-secondary" onClick={() => {
                setShowOlli(!showOlli);
            }}>Toggle Olli</Button>
            <Button variant="outline-success">Toggle Table</Button>

            {/* </Row> */}

            {showOlli && <div> 
                <b>Explore the structure and components of the chart through a text representation. Instructions: Press enter on the treeview to explore the contents of the chart. Navigate using the arrows keys. To exit, press escape.</b> 
                <p className= "olli-description" onClick={() => {setShowAxesInfo(!showAxesInfo)}}>{graphDescription}</p>

                {showAxesInfo && <p>{axesInfo}</p>}
            </div>}

        </div>
    );
};

export default GraphQA;