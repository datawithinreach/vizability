
import React, {useEffect, useState} from "react";

// olli imports
import { olli } from "olli";
import { VegaLiteAdapter } from "olli-adapters"; // Or VegaAdapter, or ObservableAdapter
import Container from 'react-bootstrap/Container';
import "../styles/Olli.css"

const Olli = ({graphSpec, showOlli}) => {

    useEffect(()=> {

        // code to render the olli treeview
        if (graphSpec) {
            VegaLiteAdapter(graphSpec).then((olliVisSpec) => {
                // console.log("graph ", graphSpec)
                // console.log(olliVisSpec.axes[0].field )
                // olliVisSpec.axes[0].field = 'year';

                // // convert inventory into int instead, it worked!
                // console.log("olli spec", olliVisSpec.data)
                // olliVisSpec.data = olliVisSpec.data.map((row)=>{
                //     return {date: row.date, inventory: parseInt(row.inventory), "Symbol(vega_id)": row["Symbol(vega_id)"]}
                // })
                // console.log("olli spec 1", olliVisSpec.data)



                const olliRender = olli(olliVisSpec);
                // console.log(olliVisSpec, graphSpec)

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
        <Container className = 'olli-section' id = 'olli-section'> 
            <h6> (For Screen Readers) Explore the structure and components of the chart through a text representation. Instructions: Press enter on the treeview to explore the contents of the chart. Navigate using the arrows keys. To exit, press escape.</h6> 
            {/* <p className= "olli-description" onClick={() => {setShowAxesInfo(!showAxesInfo)}}>{graphDescription}</p> */}
            <div id = "olli-container"></div>
           
        </Container>
    )
}


export default Olli;