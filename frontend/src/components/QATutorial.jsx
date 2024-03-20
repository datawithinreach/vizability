import React from "react";
import spec from "../charts/tutorial.json";
import GraphQA from "./GraphQA";


function QATutorial() {

    return (
        <GraphQA graphSpec={spec} />
    )
}

export default QATutorial;