import React, {useEffect, useState} from "react";

// import { Vega } from 'react-vega'

// import { createClassFromSpec } from "react-vega";
// import { VegaGragh } from "./VegaGragh";


import { VegaLite } from 'react-vega'

const GraphQA = ({graphType}) => {

    const [graphSpec, setGraphSpec] = useState({})

    // const [graph, setGraph] = useState(<p> before </p>)


    async function getGraphData(graphType) {
        // console.log('here')
        const response = await fetch("https://multimodal-accvis-6lvi554ivq-uc.a.run.app/api/get-backend-file?file_path=./test/testVegaLiteSpecs/" + graphType + ".vg");
        const data = await response.json();
        // console.log(data);
        // const response = await fetch("https://multimodal-accvis-6lvi554ivq-uc.a.run.app/api");

        console.log(data.contents);
        setGraphSpec({
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "A line chart that plots the aggregate number of homes for sale in the United States for the given years 2014-2021",
            "title": "The number of homes for sale nationally has plummeted",
            "width": 500,
            "data": {
              "url": "https://raw.githubusercontent.com/Joszek0723/excess_data/main/line_chart_data.csv"
            },
            "mark": "line",
            "encoding": {
              "x": {"title": "Date", "field": "date", "type": "temporal"},
              "y": {"title": "Number of Homes for Sale", "field": "inventory", "type": "quantitative", "axis": {"tickCount": 6}}
            }
          });
        console.log('set')
        // setGraph(<p>graphhhh</p>);
        // createClassFromSpec('BarChart', );
        // delete data.contents.$schema
        // console.log(data.contents);
     

        // setGraph(<VegaLite spec = {data.contents} onNewView={handleNewView}/>)

        // const res = {"contents":"{\n  \"$schema\": \"https://vega.github.io/schema/vega-lite/v5.json\",\n  \"description\": \"A line chart that plots the aggregate number of homes for sale in the United States for the given years 2014-2021\",\n  \"title\": \"The number of homes for sale nationally has plummeted\",\n  \"width\": 500,\n  \"data\": {\n    \"url\": \"https://raw.githubusercontent.com/Joszek0723/excess_data/main/line_chart_data.csv\"\n  },\n  \"mark\": \"line\",\n  \"encoding\": {\n    \"x\": {\"title\": \"Date\", \"field\": \"date\", \"type\": \"temporal\"},\n    \"y\": {\"title\": \"Number of Homes for Sale\", \"field\": \"inventory\", \"type\": \"quantitative\", \"axis\": {\"tickCount\": 6}}\n  }\n}\n"}

        // console.log(res.contents)
        // const data = await response.json();
        // const vLSpec = await JSON.parse(data.contents);
        // console.log(data);
    }

    // graph new data whenever graphType changes
    useEffect(() => {
        getGraphData(graphType);
        // console.log(graphSpec); 
        console.log({
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "A line chart that plots the aggregate number of homes for sale in the United States for the given years 2014-2021",
            "title": "The number of homes for sale nationally has plummeted",
            "width": 500,
            "data": {
              "url": "https://raw.githubusercontent.com/Joszek0723/excess_data/main/line_chart_data.csv"
            },
            "mark": "line",
            "encoding": {
              "x": {"title": "Date", "field": "date", "type": "temporal"},
              "y": {"title": "Number of Homes for Sale", "field": "inventory", "type": "quantitative", "axis": {"tickCount": 6}}
            }
          } != graphSpec)
    }, [graphType])


    return (
        <div>
            <p>{graphType} </p>
            {graphSpec && <VegaLite spec={graphSpec} />}
            <p> here</p>
        </div>
    );
};

export default GraphQA;