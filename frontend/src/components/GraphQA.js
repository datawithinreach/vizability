import React, {useEffect, useState} from "react";

// import { Vega } from 'react-vega'

// import { createClassFromSpec } from "react-vega";
// import { VegaGragh } from "./VegaGragh";


import { VegaLite } from 'react-vega'

const GraphQA = ({graphType}) => {

    const [graphSpec, setGraphSpec] = useState({})


    async function getGraphData(graphType) {
        const response = await fetch("https://multimodal-accvis-6lvi554ivq-uc.a.run.app/api/get-backend-file?file_path=./test/testVegaLiteSpecs/" + graphType + ".vg");
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