import React, {useEffect, useState} from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import "../styles/GraphQAStyle.css"
import Olli from "./Olli";

import { getValuesForKey, findContinentByCountry, getColorName } from "../helperFuncs";

import { VegaLite } from 'react-vega'

const GraphQA = ({graphSpec, graphType}) => {

    const [showOlli, setShowOlli] = useState(false)
    const [transformedData, setTransformedData] = useState({})

    // https://vega.github.io/vega/docs/api/view/#data-and-scales
    // get the transformed data every time there is new data, transform it then send it to the backend
    const handleNewView = view => {
        // a list of objects
        const data = view.data("source_0");
        // polish the data
        const transformedDataPolished = data.map((item) => {
            const newItem = {};
            for (const key in item) {
              if (key !== "Symbol(vega_id)") {
                if (key == "date") {
                  let tempItem = getValuesForKey(item, key);
        
                  // Create a new Date object using the timestamp
                  const date = new Date(tempItem);
        
                  // Extract the various components of the date
                  const year = date.getUTCFullYear();
                  const month = date.getUTCMonth() + 1; // Months are zero-based
                  const day = date.getUTCDate();
        
                  // Create a human-readable date string
                  const dateString = `${year}-${month}-${day}`;
                  newItem[key] = item[key]
                  newItem["formatted_date(Y-M-D)"] = dateString;
                }
                else if (key == "country") {
                  let tempItem = getValuesForKey(item, key);
                  let continentOfCountry = findContinentByCountry(tempItem);
                  newItem["continent"] = continentOfCountry;
                  newItem[key] = item[key];
                }
                else if (key == "inventory") {
                  newItem["inventory_of_houses_for_sale"] = item[key];
                }
                else {
                  newItem[key] = item[key];
                }
              }
            }
        
            // Encode Color Information
            if (graphSpec.encoding.color && graphSpec.encoding.color.field) {
              const colorScale = view.scale('color');
              const independentVariable = item[graphSpec.encoding.color.field];
              if (independentVariable !== "None") {
                const colorInfo = colorScale(independentVariable);
                newItem["Color"] = getColorName(colorInfo);
              }
            }
            return newItem;
          });
        setTransformedData(transformedDataPolished)
         // Send Transformed Data JSON to Backend
        const payload = {
            content: transformedDataPolished
        }

        fetch(process.env.REACT_APP_BACKEND_URL + "/api/process-json", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then((response) => {
            if (response.ok) {
                console.log("JSON file sent successfully.")
            } else {
                console.log("JSON file sent unsuccessfully.")
            }
        }).catch((error) => {
            console.error('Error:', error);
        })
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