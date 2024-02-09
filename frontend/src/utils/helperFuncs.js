const continentsAndCountries = {
    "Africa": [
      "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
      "Central African Republic", "Chad", "Comoros", "Democratic Republic of Congo", "Djibouti",
      "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana",
      "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar",
      "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger",
      "Nigeria", "Congo", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles",
      "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia",
      "Uganda", "Zambia", "Zimbabwe"
    ],
    "Asia": [
      "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia",
      "China", "Cyprus", "Georgia", "Hong Kong", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan",
      "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia",
      "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar",
      "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan",
      "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan",
      "Vietnam", "Yemen"
    ],
    "Europe": [
      "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria",
      "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany",
      "Greece", "Hungary", "Iceland", "Ireland", "Isle of Man", "Italy", "Kosovo", "Latvia", "Liechtenstein",
      "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands",
      "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino",
      "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine",
      "United Kingdom", "Vatican City"
    ],
    "North America": [
      "Anguilla", "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Bermuda", "Canada", "Costa Rica", "Cuba",
      "Dominica", "Dominican Republic", "El Salvador", "Greenland", "Grenada", "Guatemala", "Haiti", "Honduras",
      "Jamaica", "Mexico", "Montserrat", "Nicaragua", "Panama", "Saint Kitts and Nevis", "Saint Lucia",
      "Saint Vincent and the Grenadines", "Trinidad and Tobago", "United States"
    ],
    "Oceania": [
      "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Caledonia", "New Zealand",
      "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"
    ],
    "South America": [
      "Argentina", "Aruba", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru",
      "Suriname", "Uruguay", "Venezuela"
    ]
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
return "Null";
}


// Converts Hex Code to the Closest Math English Color Name
const matColors = {
    Amber: {
      50: '#fff8e1',
      100: '#ffecb3',
      200: '#ffe082',
      300: '#ffd54f',
      400: '#ffca28',
      500: '#ffc107',
      600: '#ffb300',
      700: '#ffa000',
      800: '#ff8f00',
      900: '#ff6f00',
    },
    'Blue Grey': {
      50: '#ECEFF1',
      100: '#CFD8DC',
      200: '#B0BEC5',
      300: '#90A4AE',
      400: '#78909C',
      500: '#607D8B',
      600: '#546E7A',
      700: '#455A64',
      800: '#37474F',
      900: '#263238',
    },
    Blue: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    Brown: {
      50: '#EFEBE9',
      100: '#D7CCC8',
      200: '#BCAAA4',
      300: '#A1887F',
      400: '#8D6E63',
      500: '#795548',
      600: '#6D4C41',
      700: '#5D4037',
      800: '#4E342E',
      900: '#3E2723',
    },
    Cyan: {
      50: '#E0F7FA',
      100: '#B2EBF2',
      200: '#80DEEA',
      300: '#4DD0E1',
      400: '#26C6DA',
      500: '#00BCD4',
      600: '#00ACC1',
      700: '#0097A7',
      800: '#00838F',
      900: '#006064',
    },
    'Deep Orange': {
      50: '#FBE9E7',
      100: '#FFCCBC',
      200: '#FFAB91',
      300: '#FF8A65',
      400: '#FF7043',
      500: '#FF5722',
      600: '#F4511E',
      700: '#E64A19',
      800: '#D84315',
      900: '#BF360C',
    },
    'Deep Purple': {
      50: '#EDE7F6',
      100: '#D1C4E9',
      200: '#B39DDB',
      300: '#9575CD',
      400: '#7E57C2',
      500: '#673AB7',
      600: '#5E35B1',
      700: '#512DA8',
      800: '#4527A0',
      900: '#311B92',
    },
    Green: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    Grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    Indigo: {
      50: '#E8EAF6',
      100: '#C5CAE9',
      200: '#9FA8DA',
      300: '#7986CB',
      400: '#5C6BC0',
      500: '#3F51B5',
      600: '#3949AB',
      700: '#303F9F',
      800: '#283593',
      900: '#1A237E',
    },
    'Light Blue': {
      50: '#E1F5FE',
      100: '#B3E5FC',
      200: '#81D4FA',
      300: '#4FC3F7',
      400: '#29B6F6',
      500: '#03A9F4',
      600: '#039BE5',
      700: '#0288D1',
      800: '#0277BD',
      900: '#01579B',
    },
    'Light Green': {
      50: '#F1F8E9',
      100: '#DCEDC8',
      200: '#C5E1A5',
      300: '#AED581',
      400: '#9CCC65',
      500: '#8BC34A',
      600: '#7CB342',
      700: '#689F38',
      800: '#558B2F',
      900: '#33691E',
    },
    Lime: {
      50: '#F9FBE7',
      100: '#F0F4C3',
      200: '#E6EE9C',
      300: '#DCE775',
      400: '#D4E157',
      500: '#CDDC39',
      600: '#C0CA33',
      700: '#AFB42B',
      800: '#9E9D24',
      900: '#827717',
    },
    Orange: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: '#FF9800',
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: '#E65100',
    },
    Pink: {
      50: '#FCE4EC',
      100: '#F8BBD0',
      200: '#F48FB1',
      300: '#F06292',
      400: '#EC407A',
      500: '#E91E63',
      600: '#D81B60',
      700: '#C2185B',
      800: '#AD1457',
      900: '#880E4F',
    },
    Purple: {
      50: '#F3E5F5',
      100: '#E1BEE7',
      200: '#CE93D8',
      300: '#BA68C8',
      400: '#AB47BC',
      500: '#9C27B0',
      600: '#8E24AA',
      700: '#7B1FA2',
      800: '#6A1B9A',
      900: '#4A148C',
    },
    Red: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#F44336',
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
    Teal: {
      50: '#E0F2F1',
      100: '#B2DFDB',
      200: '#80CBC4',
      300: '#4DB6AC',
      400: '#26A69A',
      500: '#009688',
      600: '#00897B',
      700: '#00796B',
      800: '#00695C',
      900: '#004D40',
    },
    Yellow: {
      50: '#FFFDE7',
      100: '#FFF9C4',
      200: '#FFF59D',
      300: '#FFF176',
      400: '#FFEE58',
      500: '#FFEB3B',
      600: '#FDD835',
      700: '#FBC02D',
      800: '#F9A825',
      900: '#F57F17',
    },
  };
  
function rgbToHex(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
  
function hexToLab(hex) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // Convert sRGB to XYZ
    r /= 255.0;
    g /= 255.0;
    b /= 255.0;

    if (r > 0.04045) {
        r = Math.pow((r + 0.055) / 1.055, 2.4);
    } else {
        r = r / 12.92;
    }
    if (g > 0.04045) {
        g = Math.pow((g + 0.055) / 1.055, 2.4);
    } else {
        g = g / 12.92;
    }
    if (b > 0.04045) {
        b = Math.pow((b + 0.055) / 1.055, 2.4);
    } else {
        b = b / 12.92;
    }

    r *= 100.0;
    g *= 100.0;
    b *= 100.0;

    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // Normalize XYZ
    x /= 95.047;
    y /= 100.0;
    z /= 108.883;

    // Convert XYZ to Lab
    if (x > 0.008856) {
        x = Math.pow(x, 1.0 / 3.0);
    } else {
        x = 7.787 * x + 16.0 / 116.0;
    }
    if (y > 0.008856) {
        y = Math.pow(y, 1.0 / 3.0);
    } else {
        y = 7.787 * y + 16.0 / 116.0;
    }
    if (z > 0.008856) {
        z = Math.pow(z, 1.0 / 3.0);
    } else {
        z = 7.787 * z + 16.0 / 116.0;
    }

    const L = 116.0 * y - 16.0;
    const A = 500.0 * (x - y);
    const B = 200.0 * (y - z);

    return { L, A, B };
}
  
function getColorName(colorCode) {
    let hexCode = colorCode;
  
    // Check if the color code is in RGB format
    if (colorCode.startsWith('rgb')) {
      hexCode = rgbToHex(colorCode);
    }
  
    const lab1 = hexToLab(hexCode);
    let minDeltaE = Number.MAX_VALUE;
    let closestColor = null;
  
    for (const colorName in matColors) {
      if (matColors.hasOwnProperty(colorName)) {
        const shades = matColors[colorName];
        for (const shade in shades) {
          if (shades.hasOwnProperty(shade)) {
            const hex = shades[shade];
            const lab2 = hexToLab(hex);
            const deltaL = lab1.L - lab2.L;
            const deltaA = lab1.A - lab2.A;
            const deltaB = lab1.B - lab2.B;
  
            const deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
  
            if (deltaE < minDeltaE) {
              minDeltaE = deltaE;
              closestColor = colorName;
            }
          }
        }
      }
    }
  
    return closestColor;
  }

// Processes raw .vg file
async function processFile(files) {
  return new Promise((resolve, reject) => {
      if (files.length > 0) {
          var file = files[0]; // Get the first file from the list
          if (file.name.endsWith('.json') || file.name.endsWith('.vg')) {
              var reader = new FileReader();
              reader.onload = function (e) {
                  var contents = e.target.result; // Get the file contents as text
                  resolve({
                      "contents": contents,
                  })
              };
              reader.onerror = function (error) {
                  console.error('Error occurred while reading the file.', error);
                  reject(error);
              };
              reader.readAsText(file); // Read the file as text
          } else {
              alert('Please select a JSON or VG file.');
              resolve(null);
          }
      } else {
          resolve(null);
      }
  });
}

// Load VegaLite Spec File and Send to Backend
function loadVGandSendToBackend(vegaLiteInfo) {
  if (vegaLiteInfo) {
      const vegaLiteSpec = vegaLiteInfo["contents"];
      const dataToSend = {
          vgSpec: vegaLiteSpec
      }

      fetch(process.env.REACT_APP_BACKEND_URL + "/api/process-vega-lite-spec", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
      })
          .then(response => {
              if (response.ok) {
                  console.log('VG Spec sent successfully!');
              } else {
                  console.error('Failed to send VG Spec.');
              }
          })
          .catch(error => {
              console.error('Error in sending spec:', error);
          });
  }
}
// Sends Question to OpenAPI and Casts Output Answer to DOM Elements
// No Specific Agent is Used
async function sendPromptDefault(question, gpt_model) {
  // console.log("prompt", question);
  return fetch(process.env.REACT_APP_BACKEND_URL + "/api/prompt?question=" + question + "&gpt_model=" + gpt_model, { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // console.log("response", data["response"]);
      return data["response"];
    });
}

async function getSuggestedQuestions(condensedString) {
  return fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=gptPrompts/initialSuggestionPrompt.txt", { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(async function (initialSuggestionsRaw) {
      var modifiedString;
      var initialSuggestions = initialSuggestionsRaw["contents"];
      var searchString = "follows:";
      var index = initialSuggestions.indexOf(searchString);
      if (index !== -1) {
        modifiedString = initialSuggestions.substring(0, index + searchString.length) + "\n" + condensedString + initialSuggestions.substring(index + searchString.length);
      } else {
        console.log("Substring 'follows:' not found in the initialSuggestions string.");
      }
      return sendPromptDefault(modifiedString, "gpt-3.5-turbo-1106")
        .then(function (output) {
          return output; // Return the output value if needed for further processing
        })
        .catch(function (error) {
          console.error(error);
        });
    })
}

async function classifyQuery(question) {
  return fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-validation-few-shot-prompting?user_query=" + question, { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(async function (classificationQuery) {
      var classificationQueryContents = classificationQuery["contents"];

      return sendPromptDefault(classificationQueryContents + question, "gpt-3.5-turbo-1106")
        .then(function (output) {
          return output; // Return the output value if needed for further processing
        })
        .catch(function (error) {
          console.error(error);
        });
    });
}

// Sends Question to OpenAPI
// LLM Uses a Specific CSV Agent
export async function sendPromptAgent(supplement, question) {
  return fetch(process.env.REACT_APP_BACKEND_URL + "/api/apply-agent?question=" + supplement + question, { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return data.response;
    })
}

export async function handleNavigationQuery(question) {
  return fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=gptPrompts/navigationQuery.txt", { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(async function (navigationQuery) {
      var navigationQueryContents = navigationQuery["contents"];

      return sendPromptDefault(navigationQueryContents + question, "gpt-3.5-turbo-1106")
        .then(function (output) {
          return output; // Return the output value if needed for further processing
        })
        .catch(function (error) {
          console.error(error);
        });
    });
}

async function getAnswer(question, hierarchy, activeElementNodeAddress, activeElementNodeInnerText, tree) {
  // Initialize Variables
  const descrPre = "\nHere's a structural layout of a data set. It is a hierarchy/tree data structure, where each sentence is preceded by its placement within the tree. For instance, 1.1.2 refers to the second child of the first child of the head:\n";

  const descrPostFilePath = "gptPrompts/descrPost.txt";

  let supplement = descrPre + hierarchy + "Active Element: " + (activeElementNodeAddress + " // " + activeElementNodeInnerText + "\n");

  // console.log("sending the question to the server", supplement + question);
  // console.log("get answer", question)

  // Classify User Question
  // Classification Categories Include: Analytical Query; Visual Query; Contextual Query; Navigation Query
  console.log('getting answer', question)
  try {
    const queryType = await classifyQuery(question);
    console.log("type", queryType);
    // Apply Answering Pipeline Based on Classification Response
    let classificationExplanation = "";
    const improveUserQueryPromptFilePath = "gptPrompts/improveUserQueryPrompt.txt";



    const improveUserQueryPromptRawRes = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=" + improveUserQueryPromptFilePath, { redirect: 'manual' })
    const improveUserQueryPromptRaw = await improveUserQueryPromptRawRes.json();
    let improveUserQueryPrompt = improveUserQueryPromptRaw["contents"];
    improveUserQueryPrompt = improveUserQueryPrompt.replace("{Description}", supplement).replace("{Question}", question);

    // getting revised question
    let questionRevised = await sendPromptDefault(improveUserQueryPrompt, "gpt-4");
    if (questionRevised.startsWith("Question:")) {
      questionRevised = questionRevised.slice("Question:".length).trim();
    }

    if (queryType.includes("Analytical Query") || queryType.includes("Visual Query")) {
      const descrPostRawRes = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=" + descrPostFilePath);
      const descrPostJSON = await descrPostRawRes.json();
      const descrPost = descrPostJSON["contents"];
      classificationExplanation = "Your question \"" + question + "\" was categorized as being data-driven, and as such, has been answered based on the data in the chart.";

      const answer = await sendPromptAgent(supplement + descrPost, questionRevised);

      return answer

    } else if (queryType.includes("Contextual Query")) {
      const answer = sendPromptDefault("Here is a description of a dataset:" + hierarchy + "Use this description of the dataset along with outside knowledge to answer the following question:\nQuestion: " + questionRevised, "gpt-3.5-turbo-1106");
      return answer

    } else if (queryType.includes("Navigation Query")) {
      // Provide Context to OpenAPI about User's Current Position within the Olli Treeview

      // Packaged Question to be Sent to OpenAPI
      const navigationQuestion = supplement + "\nUse all of this to answer the following question:\n" + questionRevised;
      const classificationExplanation = "Your question \"" + question + "\" was categorized as being related to navigating the chart structure, and as such has been answered based on the treeview.";
      // Answer Navigation Query
      const response = await handleNavigationQuery(navigationQuestion);
      // Regular expression to match the starting and ending addresses
      const startingAddressPattern = /Starting Address: ([\d.]+)/;
      const endingAddressPattern = /Ending Address: ([\d.]+)/;
      // Extract starting and ending addresses using regular expressions
      const startingAddressMatch = response.match(startingAddressPattern);
      const endingAddressMatch = response.match(endingAddressPattern);

      let navigationResponse = "";
      let startingAddress = "";
      let endingAddress = "";

      if (endingAddressMatch && startingAddressMatch) {
        // Extracted addresses
        startingAddress = startingAddressMatch[1];
        endingAddress = endingAddressMatch[1];

        let endNode = tree.getNodeFromAddress(endingAddress);
        console.log("End Node: ", endingAddress);
        let startNode = tree.getNodeFromAddress(startingAddress);
        console.log("Start Node: ", startingAddress);
        navigationResponse = tree.getShortestPath(startNode, endNode); 
      } else {
        if (startingAddressMatch) {
          startingAddress = startingAddressMatch[1];
          const startingNode = tree.getNodeFromAddress(startingAddress);
          navigationResponse = "Current Position: " + startingNode.getInnerText();
        }
        else {
          navigationResponse = "The question was interpreted as involving navigation but either no starting/ending point was provided or the Treeview was not activated. Please try again.";
        }
      }
    
      return navigationResponse;
    } else {   // Query Cannot be Classified by LLM
      const descrPostRawRes = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get-backend-file?file_path=" + descrPostFilePath);
      const descrPostJSON = await descrPostRawRes.json();
      const descrPost = descrPostJSON["contents"];
      classificationExplanation = "Your question \"" + question + "\" was categorized as being data-driven, and as such, has been answered based on the data in the chart.";
      const answer = await sendPromptAgent(supplement + descrPost, questionRevised);

      return answer
    }

  } catch (error) {
    console.log("Error in getting answer: ", error)
  }
}


export {getAnswer, getSuggestedQuestions, getValuesForKey, findContinentByCountry, getColorName, processFile, loadVGandSendToBackend }
