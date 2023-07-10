// use fetch to send a request to the backend /prompt with the parameter text 
// and display the text in the div with id="prompt"
// and then display the response in the div with id="response"

import Tree from "./tree.js"

// sends question to OpenAPI and casts output answer to DOM elements

function getColorName(hexInput) {
  const CSS21_HEX_TO_NAMES = {
    // CSS21 color names and their hex values
    // Add more color names and values if needed
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
    // Convert a hexadecimal color string to an RGB triplet
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

function handleSubmit(event, hierarchy) {
  event.preventDefault();
  var question = document.getElementById("user-query");
  const supplement = descrPre + hierarchy + descrPost;
  console.log("sending the question to the server", supplement + question.value);

  classifyQuery(question.value).then(function (queryType) {
    console.log(queryType);
    if (queryType.includes("Analytical Query") || queryType.includes("Visual Query")) {
      sendPromptAgent(supplement, question.value);
      question.value = '';
    }
    else if (queryType.includes("Contextual Query")) {
      sendPromptDefault(question.value).then(function (response) {
        document.getElementById("prompt").textContent = question.value;
        document.getElementById("response").textContent = response;
        question.value = '';
      })
    }
    else if (queryType.includes("Navigation Query")) {
      // implement later
      // use hierarchy
    }
    else {
      document.getElementById("prompt").textContent = question.value;
      document.getElementById("response").textContent = queryType;
      question.value = '';
    }
  })
    .catch(function (error) {
      console.error(error); // Handle any errors that occurred during the promise
    });
}

// sends question to OpenAPI for classification and returns output string
async function classifyQuery(question) {
  const filePath = "gptPrompts/queryClassification.txt"
  return fetch("/api/get-backend-file?file_path=" + filePath, { redirect: 'manual' })
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

// sends question to OpenAPI and casts output answer to DOM elements
// no specific agent is used
async function sendPromptDefault(question) {
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

// sends question to OpenAPI and casts output answer to DOM elements
// llm uses a specific agent
function sendPromptAgent(supplement, question) {
  console.log("prompt", question);
  fetch("/api/apply-agent?question=" + supplement + question, { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("response", data);
      document.getElementById("prompt").textContent = question;
      document.getElementById("response").textContent = data.response;
    })
}

/*globals vegaLite, vega, olli OlliAdapters */
let tree;
let vLSpec = "";

const contextArray = [];
const stringDescr = "Below is the JSON data for a graph. Use it to answer the following question. \n"

var ariaLevel = 1;

const descrPre = "Here's a description of a data set. It is a hierarchy, where each sentence is preceded by its ranking (for instance: 1a or 3b):\n";
const descrPost = "Use this information along with everything else you are given to answer the following question: \n";


const handleVegaLiteSpecChange = async function (event) {
  // Update the vegaLiteSpec variable with the new value
  console.log(event.detail);
  vLSpec = await JSON.parse(event.detail);
  const vegaContainer = document.getElementById("vega-container");

  const vegaSpec = vegaLite.compile(vLSpec).spec
  console.log(vegaSpec);
  const view = await new vega.View(vega.parse(vegaSpec))
    .logLevel(vega.Warn)
    .initialize(vegaContainer)
    .renderer("svg")
    .hover()
    .runAsync();
  console.log(view);

  // code to render the olli treeview
  const olliContainer = document.getElementById("olli-container");

  OlliAdapters.VegaLiteAdapter(vLSpec).then((olliVisSpec) => {
    const olliRender = olli(olliVisSpec);
    olliContainer.innerHTML = "";
    olliContainer.append(olliRender);
  });

  olliContainer.addEventListener('keyup', event => {
    const currentElement = document.activeElement;
    if (currentElement.getElementsByTagName("span")[0]) {
      pushToContextArray(currentElement.getElementsByTagName("span")[0].innerHTML, currentElement.ariaLevel);
    }
    else if (currentElement.tagName == 'TABLE') {
      var tBody = currentElement.getElementsByTagName("tbody")[0];
      var dataArray = [];
      Array.from(tBody.getElementsByTagName("tr")).forEach((element) => {
        dataArray.push(element.ariaLabel);
      })
      pushToContextArray(dataArray, currentElement.ariaLevel);
    }
    printContextArray();
    const myJSON = stringifyContextArray();
  });

  // add visual query info to csv/json file
  if (vLSpec.encoding.color && vLSpec.encoding.color.field) {
    try {
      console.log("Color Information Found");
      const colorScale = view.scale('color');

      const filePath = "data/file.csv";
      const dataContents = await fetch("/api/get-backend-file?file_path=" + filePath);
      const dataContentsParsed = await dataContents.json();
      const dataContentsString = dataContentsParsed.contents;

      console.log(dataContentsString);

      const rows = dataContentsString.split('\n');
      rows[rows.length - 1] === "" && (rows.pop(), rows);

      
      const headerRow = rows[0].split(',');
      headerRow.push('color');

      const indexColor = headerRow.indexOf(vLSpec.encoding.color.field);
      const indexX = headerRow.indexOf(vLSpec.encoding.x.field);

      rows[0] = headerRow.join(',');

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        const independentVariable = row[indexColor];
        const xVariable = row[indexX];
        if (independentVariable != "None" && xVariable != "None" && row.length < headerRow.length && independentVariable) { // last two conditions are temporary until transform feature is implemented
          const colorInfo = colorScale(independentVariable);
          const colorName = getColorName(colorInfo);
          row.push(colorName);

          // Update the row in the rows array
          rows[i] = row.join(',');
        }
        else {
          row.push("None");
          rows[i] = row.join(',');
        }
      }

      // Join the modified rows back into a CSV string
      const updatedCsvString = rows.join('\n');
      console.log(updatedCsvString);

      // Send the updated CSV string to the backend for future visual queries
      const payload = {
        content: updatedCsvString
      }

      fetch("/api/process-csv", {
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

    } catch (error) {
      console.log("Error: " + error);
    }
  }

  tree = new Tree(document.querySelector('.olli-vis'));
};

document.addEventListener('vegaLiteSpecChange', handleVegaLiteSpecChange);

// Attach the submit event listener outside of handleVegaLiteSpecChange
document.getElementById("ask-question").addEventListener('submit', (event) => {
  event.preventDefault();
  const hierarchy = tree.getHierarchy((hierarchy) => {
    // Pass the hierarchy to the handleSubmit function
    handleSubmit(event, hierarchy);
  });
});

// prints context to the console
function printContextArray() {
  for (var i = 0; i < contextArray.length; i++) {
    console.log(contextArray[i]);
  }
}

// converts context to JSON, to be fed to ChatGPT
function stringifyContextArray() {
  return stringDescr + JSON.stringify(contextArray);
}

// pushes relevant context to array based on the position within Olli
function pushToContextArray(element, elementAriaLevel) {
  if (ariaLevel == elementAriaLevel) {
    contextArray.pop();
  }
  else if (ariaLevel > elementAriaLevel) {
    for (var i = 0; i < 2; i++) {
      contextArray.pop();
    }
    ariaLevel--;
  }
  else {
    ariaLevel++
  }
  contextArray.push(element);
}

// event listener for keyup events
// triggers upon navigating through the Olli hierarchy
