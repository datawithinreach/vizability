import React, {useEffect, useState} from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import "../styles/GraphQAStyle.css"
import Olli from "./Olli";

import { VegaLite } from 'react-vega'

const GraphQA = ({graphSpec, graphType}) => {

    const [showOlli, setShowOlli] = useState(false)
    const [transformedData, setTransformedData] = useState({})

    // https://vega.github.io/vega/docs/api/view/#data-and-scales
    // get the transformed data every time there is new data
    const handleNewView = view => {
        // a list of objects
        const data = view.data("source_0");
        // polish the data
        setTransformedData(view.data("source_0"))

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

            {showOlli && <Olli transformedData = {transformedData} graphSpec = {graphSpec} graphType={graphType}/> }

        </div>
    );
};

export default GraphQA;