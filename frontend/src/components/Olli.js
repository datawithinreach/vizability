
import React, {useEffect, useState} from "react";

// olli imports
import { olli } from "olli";
import { VegaLiteAdapter } from "olli-adapters"; // Or VegaAdapter, or ObservableAdapter


const Olli = ({graphSpec, graphType, transformedData}) => {
    // const [showAxesInfo, setShowAxesInfo] = useState(false)

    // const [graphDescription, setGraphDescription] = useState("")
    // const [axesInfo, setAxesInfo] = useState("Axes info")

    // const typeDescriptions = {
    //     chart1: "A line chart",
    //     chart2: "A bar chart",
    //     chart3: "A scatter plot",
    //     chart4: "A geographic map",
    // }

    useEffect(()=> {
        // // structure the olli description based on the graph type
        // if (graphType === "chart4") { //choropleth is special (color and detail instead of xy)
        //     setGraphDescription(`${graphSpec.description ? graphSpec.description + '.': ''} ${typeDescriptions[graphType]}: ${graphSpec.encoding.color.field} and ${graphSpec.encoding.detail.field}.`)
        // } else {
        //     setGraphDescription(`${graphSpec.description ? graphSpec.description + '.': ''} ${typeDescriptions[graphType]} with axes: ${graphSpec.encoding.x.title ? graphSpec.encoding.x.title : graphSpec.encoding.x.field } and ${graphSpec.encoding.y.title ? graphSpec.encoding.y.title : graphSpec.encoding.y.field}.`)

        //     // setAxesInfo(`X-axes titled ${dataObj.encoding.x.field} for a ${dataObj.encoding.x.type} scale with  `)
        //     console.log(graphSpec.encoding)
        // }

        // // get the axes info
        // console.log(transformedData)

        // code to render the olli treeview
        if (graphSpec) {
            VegaLiteAdapter(graphSpec).then((olliVisSpec) => {
            const olliRender = olli(olliVisSpec);
            console.log("spec", olliVisSpec)
            document.getElementById("olli-container").replaceChildren(olliRender);
        }).catch((e) => {
            console.log('error', e)
        })};
    }, [graphSpec])

    return (
        <div> 
            <b>(For Screen Readers) Explore the structure and components of the chart through a text representation. Instructions: Press enter on the treeview to explore the contents of the chart. Navigate using the arrows keys. To exit, press escape.</b> 
            {/* <p className= "olli-description" onClick={() => {setShowAxesInfo(!showAxesInfo)}}>{graphDescription}</p> */}
            <div id= "olli-container"></div>

            {/* {showAxesInfo && <p>{axesInfo}</p>} */}
           
        </div>
    )
}


export default Olli;