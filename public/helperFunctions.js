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
  const continentsAndCountries = {
    "Africa": [
      "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
      "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of Congo", "Cote d'Ivoire",
      "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana",
      "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania",
      "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal",
      "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia",
      "Uganda", "Zambia", "Zimbabwe"
    ],
    "Asia": [
      "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China",
      "Cyprus", "Georgia", "Hong Kong", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait",
      "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea",
      "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka",
      "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates",
      "Uzbekistan", "Vietnam", "Yemen"
    ],
    "Europe": [
      "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus",
      "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
      "Isle of Man", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro",
      "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia",
      "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City"
    ],
    "North America": [
      "Anguilla", "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Bermuda", "Canada", "Costa Rica", "Cuba", "Dominica", "Dominican Republic",
      "El Salvador", "Grenada", "Greenland", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico", "Montserrat", "Nicaragua", "Panama", "Saint Kitts and Nevis",
      "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago", "United States"
    ],
    "South America": [
      "Argentina", "Aruba", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"
    ],
    "Australia": [
      "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Caledonia", "New Zealand", "Palau", "Papua New Guinea", "Samoa",
      "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"
    ],
    "Antarctica": ["Antarctica"]
  };
  
  // Function to get values for a given key
  function getValuesForKey(obj, key) {
    return obj[key] || []; // Return the array of values for the key or an empty array if the key doesn't exist
  }

  function findContinentByCountry(countryName) {
    for (const continent in continentsAndCountries) {
      if (continentsAndCountries[continent].includes(countryName)) {
        return continent;
      }
    }
    return "Country not found in the dictionary";
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
        else if (key == "country"){
          let tempItem = getValuesForKey(item, key);
          let continentOfCountry = findContinentByCountry(tempItem);
          newItem["continent"] = continentOfCountry;
          newItem[key] = item[key];
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
        // Add chart here
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

  // for (const key in CSS21_HEX_TO_NAMES) {
  //   const name = CSS21_HEX_TO_NAMES[key];
  //   const [rC, gC, bC] = hexToRgb(key);
  //   const deltaE = calculateDeltaE([rC, gC, bC], rgbTriplet);
  //   minColours[deltaE] = name;
  // }

  // const minDeltaE = Math.min(...Object.keys(minColours));
  // return minColours[minDeltaE];
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
