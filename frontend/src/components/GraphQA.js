import React, {useState} from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import "../styles/GraphQAStyle.css"
import Olli from "./Olli";
import loadingLogo from "../images/loadingLogo1.gif"
import { getValuesForKey, findContinentByCountry, getColorName } from "../helperFuncs";

import { VegaLite } from 'react-vega'
import GraphTable from "./GraphTable";


const GraphQA = ({graphSpec, graphType, setGraphSpec}) => {

    const [showOlli, setShowOlli] = useState(false)
    const [showTable, setShowTable] = useState(false)
    const [transformedData, setTransformedData] = useState([])

    const [isViewShowing, setIsViewShowing] = useState(false)

    function polishData (data, view) {
    /**
     * Return a list of objects with polished data.
     * @param data data from the vega view
     * @param view vega view
     */
    return data.map((item) => {
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
    }

  
    function handleViewUpdates (view) {
      /**
       * Transforms the unpolished data from view to send to the backend
       * and updates all neccessary states.
       * @param view Vega view.
       */
      const data = view.data("source_0");
      const transformedDataPolished = polishData(data, view);
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



    // https://vega.github.io/vega/docs/api/view/#data-and-scales
    const handleNewView = view => {
    /**
     * Get the transformed data every time there is a view update,
     * transform it then send it to the backend.
     * @param view Vega view
     */
      // logic for loading in loading picture while waiting for vega to render
      setIsViewShowing(true)

      handleViewUpdates(view);

      // Updates Transformed Data, add event listener
      const sliderInput = document.querySelector('input[type="range"]');
      if (sliderInput) {
        const parameterName = sliderInput.getAttribute("name");
        sliderInput.addEventListener("input", () => {
          const valueChanged = parseInt(sliderInput.value, 10);
          view.signal(parameterName, valueChanged).runAsync();
          // find which param got updated to update the spec to rerender the olli
          const newSpec = {...graphSpec};
          for (let i = 0; i < newSpec.params.length; i++) { 
            if (newSpec.params[i].name === parameterName) {
              newSpec.params[i].value = valueChanged;
            }
          }
          setGraphSpec(newSpec);
          handleViewUpdates(view);
        });
      }

      // reset for next new
      setIsViewShowing(false)
    };

    return (
        <div>
            <Row>{graphSpec && <VegaLite spec={graphSpec} onNewView={handleNewView}/>}</Row>
            
            {graphType && !graphSpec && !isViewShowing && 
            <div>
              <img src={loadingLogo} alt="loading..." />
            </div>
            }

            {graphSpec && <span>

                  <Button variant="outline-secondary" onClick={() => {
                    setShowOlli(!showOlli);
                    if (!showOlli) { // olli should be true now
                      setShowTable(false)
                    }
                }}>Toggle Olli</Button>

                <Button variant="outline-success"  onClick={() => {
                    setShowTable(!showTable);
                    if (!showTable) { // table should be true now
                      setShowOlli(false)
                    }
                }}>Toggle Table</Button>

                </span>}


            {showOlli && <Olli transformedData = {transformedData} graphSpec = {graphSpec} graphType={graphType}/> }

            {showTable &&  <GraphTable transformedData={transformedData} />}
        </div>
    );
};

export default GraphQA;