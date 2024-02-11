
import React, {useEffect, useState} from "react";

// olli imports
import { olli } from "olli";
import { VegaLiteAdapter } from "olli-adapters"; // Or VegaAdapter, or ObservableAdapter


const Olli = ({graphSpec, showOlli}) => {

    useEffect(()=> {

        // code to render the olli treeview
        if (graphSpec) {
            VegaLiteAdapter(graphSpec).then((olliVisSpec) => {
                // console.log("graph ", graphSpec)
                // console.log(olliVisSpec.axes[0].field )
                // olliVisSpec.axes[0].field = 'year';
                // console.log("olli spec", olliVisSpec)

                const olliRender = olli(olliVisSpec);

                if (document.getElementById("olli-container")) {
                    document.getElementById("olli-container").replaceChildren(olliRender);
                }
        }).catch((e) => {
            console.log('Error in olliSpec:', e)
        })};
    }, [graphSpec])

    useEffect(()=> {
        // For toggling purposes because we want the olli-containter to always be accessible
        const olliSection =  document.getElementById("olli-section");
        if (!showOlli) {
            olliSection.style.display = "none"
        } else {
            olliSection.style.display = "block"
        }
    }, [showOlli])

    return (
        <div id = 'olli-section'> 
            <b>(For Screen Readers) Explore the structure and components of the chart through a text representation. Instructions: Press enter on the treeview to explore the contents of the chart. Navigate using the arrows keys. To exit, press escape.</b> 
            {/* <p className= "olli-description" onClick={() => {setShowAxesInfo(!showAxesInfo)}}>{graphDescription}</p> */}
            <div id = "olli-container"></div>
           
        </div>
    )
}


export default Olli;