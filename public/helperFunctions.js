// Helper Functions for main.js and eval/test.js

// Functions for main.js

export async function classifyQuery(question) {
  return fetch("/api/get-validation-few-shot-prompting?user_query=" + question, { redirect: 'manual' })
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

  // Function to get values for a given key
  function getValuesForKey(obj, key) {
    return obj[key] || []; // Return the array of values for the key or an empty array if the key doesn't exist
  }

  // Get Transformed Data from Raw Data Set
  const transformedData = view.data("source_0");
  const transformedDataPolished = transformedData.map((item) => {
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
          newItem["formatted_date"] = dateString;
        }
        else {
          newItem[key] = item[key];
        }
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
        // Add Table Functionality 
        async function fetchCSVData() {
          const response = await fetch('/api/get-backend-file?file_path=data/file.csv');
          const text = await response.json();
          const textFormatted = await text["contents"];
          console.log(typeof textFormatted);
          return textFormatted;
        }

        async function populateTable() {
          const csvData = await fetchCSVData();
          const rows = csvData.trim().split('\n');
          const headers = rows.shift().split(',');

          const table = document.getElementById('csv-table');

          table.innerHTML = '';

          const dataType = []; // To store the data type of each column

          // Add table headers
          const headerRow = document.createElement('tr');
          for (const header of headers) {
            const th = document.createElement('th');
            th.textContent = header;

            // Add click event listener to sort by the clicked header
            th.addEventListener('click', async () => {
              order = order === 'asc' ? 'desc' : 'asc'; // Toggle order
              await sortTable(header, order);
              populateTable(); // Refresh the table after sorting
            });
            headerRow.appendChild(th);

            // Initialize the data type of each column as "string" by default
            dataType.push('string');
          }
          table.appendChild(headerRow);

          // Determine the data type of each column
          for (const row of rows) {
            const rowData = row.split(',');
            for (let i = 0; i < rowData.length; i++) {
              if (!isNaN(rowData[i])) {
                dataType[i] = 'number';
              }
            }
          }

          // Add table rows
          for (const row of rows) {
            const rowData = row.split(',');
            const tr = document.createElement('tr');
            for (let i = 0; i < rowData.length; i++) {
              const td = document.createElement('td');
              if (dataType[i] === 'number') {
                // Convert to number for numerical sorting
                td.textContent = parseFloat(rowData[i]);
              } else {
                td.textContent = rowData[i];
              }
              tr.appendChild(td);
            }
            table.appendChild(tr);
          }
        }

        let order = 'asc';

        async function sortTable(field, order, dataType) {
          const response = await fetch(`/sort_csv?field=${field}&order=${order}&dataType=${dataType}`);
          const result = await response.json();
          if (result.message) {
            populateTable();
          }
        }

        populateTable();


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
function getColorName(input) {
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

  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i;
  let rgbTriplet = null;
  if (!rgbRegex.test(input)) {
    rgbTriplet = hexToRgb(input);
  } else {
    rgbTriplet = input
      .substring(4, input.length - 1)
      .split(",")
      .map(value => parseInt(value.trim(), 10));
  }

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
export async function sendPromptAgent(supplement, question, loadingAnnouncement, classificationExplanation, isTest) {
  console.log("prompt", supplement + question);
  return fetch("/api/apply-agent?question=" + supplement + question, { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!isTest) {
        const loadStatus = document.getElementById("load-status");
        const loadContent = document.getElementById("load-content");
        const responseInfo = document.getElementById("response-info");

        // Clear the loading announcement
        clearInterval(loadingAnnouncement);

        // Step 4
        loadStatus.innerHTML = "Response Generated";

        // Step 5
        responseInfo.style.display = "block";
        document.getElementById("prompt").innerText = "Question: " + classificationExplanation;
      }
      else {
        document.getElementById("prompt").innerText = "Question: " + question;
      }

      (data.response != "Agent stopped due to iteration limit or time limit.") ? document.getElementById("response").textContent = "Answer: " + data.response : document.getElementById("response").textContent = "Answer: I'm sorry; the process has been terminated because it either took too long to arrive at an answer or your question was too long.";

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
  activeElement = activeElement.replace("Press t to open table.", "").replace("1 value.", "").replace(" equals", ":");
  let firstPeriodIndex = activeElement.indexOf(".");
  let ofIndex = activeElement.indexOf(" of ");

  if (ofIndex !== -1 && firstPeriodIndex !== -1 && ofIndex < firstPeriodIndex) {
    activeElement = activeElement.slice(firstPeriodIndex + 2);
  }
  console.log(activeElement);
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

export function processInstructions(inputString) {
  const instructions = inputString.split('.');
  const processedInstructions = [];
  let currentInstruction = instructions[0];
  let iterationCount = 1;

  for (let i = 1; i < instructions.length; i++) {
    if (instructions[i] === currentInstruction) {
      iterationCount++;
    } else {
      processedInstructions.push(
        `Press the ${currentInstruction} arrow key ${iterationCount} times`
      );
      currentInstruction = instructions[i];
      iterationCount = 1;
    }
  }

  processedInstructions.push(
    `Press the ${currentInstruction} arrow key ${iterationCount} times`
  );

  const final_string = processedInstructions.join('. ');

  return {
    final_string,
    iterationCount: processedInstructions.length,
  };
}
