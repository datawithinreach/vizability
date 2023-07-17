// Helper Functions for main.js and eval/test.js

// Functions for main.js

export async function classifyQuery(question) {
    return fetch("/api/get-backend-file?file_path=gptPrompts/queryClassification.txt", { redirect: 'manual' })
      .then(function (response) {
        return response.json();
      })
      .then(async function (classificationQuery) {
        var classificationQueryContents = classificationQuery["contents"];
  
        return sendPromptDefault(classificationQueryContents + question)
          .then(function (output) {
            return output; // Return the output value if needed for further processing
          })
          .catch(function (error) {
            console.error(error);
          });
      });
  }



// Functions for main.js and eval/test.js

export function handleDataUpdate(view, vegaLiteSpec) {
    // Get Transformed Data from Raw Data Set
    const transformedData = view.data("source_0");
    const transformedDataPolished = transformedData.map((item) => {
        const newItem = {};
        for (const key in item) {
            if (key !== "Symbol(vega_id)") {
                newItem[key] = item[key];
            }
        }

        // Encode Color Information
        if (vegaLiteSpec.encoding.color && vegaLiteSpec.encoding.color.field) {
            const colorScale = view.scale('color');
            const independentVariable = item[vegaLiteSpec.encoding.color.field];
            if (independentVariable != "None") {
                const colorInfo = colorScale(independentVariable);
                newItem["Color"] = getColorName(colorInfo);
            }
        }
        return newItem;
    });

    // Send Transformed Data JSON to Backend
    const payload = {
        content: transformedDataPolished
    }

    fetch("/api/process-json", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (response.ok) {
                console.log('CSV file sent successfully!');
            } else {
                console.error('Failed to send CSV file.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Helper Method for handleDataUpdate
// Converts Hex Code to the Closest Math English Color Name
function getColorName(hexInput) {
    const CSS21_HEX_TO_NAMES = {
        // CSS21 Color Names and Their Hex Values
        "#00ffff": "aqua",
        "#000000": "black",
        "#8a2be2": "blueviolet",
        "#808080": "grey",
        "#0000ff": "blue",
        "#ff00ff": "fuchsia",
        "#008000": "green",
        "#00ff00": "lime",
        "#800000": "maroon",
        "#000080": "navy",
        "#808000": "olive",
        "#800080": "purple",
        "#ff0000": "red",
        "#c0c0c0": "silver",
        "#008080": "teal",
        "#ffffff": "white",
        "#ffff00": "yellow",
        "#ffa500": "orange",
        "#964B00": "brown",
        "#00ffff": "cyan",
        "#00008b": "darkblue",
        "#006400": "darkgreen",
        "#556b2f": "darkolivegreen",
        "#8b0000": "darkred",
        "#add8e6": "lightblue",
        "#ffb6c1": "lightpink",
        "#90ee90": "lightgreen",
        "#ff4500": "orangered"
    };

    function hexToRgb(hex) {
        // Convert a Hexadecimal Color String to an RGB Triplet
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }
    const rgbTriplet = hexToRgb(hexInput);
    const minColours = {};
    for (const key in CSS21_HEX_TO_NAMES) {
        const name = CSS21_HEX_TO_NAMES[key];
        const [rC, gC, bC] = hexToRgb(key);
        const rd = Math.pow(rC - rgbTriplet[0], 2);
        const gd = Math.pow(gC - rgbTriplet[1], 2);
        const bd = Math.pow(bC - rgbTriplet[2], 2);
        minColours[rd + gd + bd] = name;
    }

    const minDistance = Math.min(...Object.keys(minColours));
    return minColours[minDistance];
}

// Sends Question to OpenAPI and Casts Output Answer to DOM Elements
// No Specific Agent is Used
export async function sendPromptDefault(question) {
    console.log("prompt", question);
    return fetch("/api/prompt?question=" + question, { redirect: 'manual' })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("response", data["response"]);
        return data["response"];
      });
  }
  
  // Sends Question to OpenAPI and Casts Output Answer to DOM Elements
  // LLM Uses a Specific CSV Agent
  export async function sendPromptAgent(supplement, question) {
    console.log("prompt", question);
    return fetch("/api/apply-agent?question=" + supplement + question, { redirect: 'manual' })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("response", data);
        document.getElementById("prompt").textContent = question;
        document.getElementById("response").textContent = data.response;
        return data.response;
      })
  }

  export async function handleNavigationQuery(question) {
    return fetch("/api/get-backend-file?file_path=gptPrompts/navigationQuery.txt", { redirect: 'manual' })
      .then(function (response) {
        return response.json();
      })
      .then(async function (navigationQuery) {
        var navigationQueryContents = navigationQuery["contents"];
  
        return sendPromptDefault(navigationQueryContents + question)
          .then(function (output) {
            return output; // Return the output value if needed for further processing
          })
          .catch(function (error) {
            console.error(error);
          });
      });
  }

  export function getActiveAddress(activeElement, hierarchy) {
    const hierarchyArray = hierarchy.split("\n");
    for (let element of hierarchyArray) {
      if (element.includes(activeElement)) {
        const index = element.indexOf("//");
        const activeAddress = element.substring(0, index);
        return activeAddress;
      }
    }
    return null;
  }
  