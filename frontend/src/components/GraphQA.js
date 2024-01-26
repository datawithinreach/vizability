import React, {useEffect, useState} from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import "../styles/GraphQAStyle.css"

import { VegaLite } from 'react-vega'

const GraphQA = ({graphSpec, axesInfo, graphDescription}) => {

    const [showOlli, setShowOlli] = useState(false)
    const [showAxesInfo, setShowAxesInfo] = useState(false)


    // graph new data whenever graphType changes
    // useEffect(() => {
    //     getGraphData(graphType);
    // }, [graphType])

    // https://vega.github.io/vega/docs/api/view/#data-and-scales
    const handleNewView = view => {
        console.log(
            'here'
        );
        // console.log(view.data);
        console.log(view.data("source0"));
    };


    return (
        <div>
            <Row>{graphSpec && <VegaLite spec={graphSpec} onNewView={handleNewView}/>}</Row>

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