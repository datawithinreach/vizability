import React, {useEffect, useState} from "react";

// import { Vega } from 'react-vega'

// import { createClassFromSpec } from "react-vega";
// import { VegaGragh } from "./VegaGragh";


import { VegaLite } from 'react-vega'

const GraphQA = ({graphType}) => {

    const [graphSpec, setGraphSpec] = useState(false)


    async function getGraphData(graphType) {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=./test/testVegaLiteSpecs/" + graphType + ".vg");
        const data = await response.json();
        setGraphSpec(JSON.parse(data.contents));
    }

    // graph new data whenever graphType changes
    useEffect(() => {
        getGraphData(graphType);
    }, [graphType])


    return (
        <div>
            <p>{graphType} </p>
            {graphSpec && <VegaLite spec={graphSpec} />}
        </div>
    );
};

export default GraphQA;