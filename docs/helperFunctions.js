// Helper Functions for main.js and eval/test.js
const isProduction = window.location.hostname !== '127.0.0.1';
const serverAddress = isProduction
  ? "https://vizability-1006314949515.us-central1.run.app"
  : "http://127.0.0.1:8000";

/**
 * Classifies a user's query by sending it to an API and getting a response from GPT-3.5.
 * @param {string} question - The question or query to classify.
 * @returns {Promise<string>} - The output from the classification process.
 */
export async function classifyQuery(question) {
  try {
    // Fetch classification query from the server
    const response = await fetch(`${serverAddress}/api/get-validation-few-shot-prompting?user_query=${encodeURIComponent(question)}`, { redirect: 'manual' });
    const classificationQuery = await response.json();
    const classificationQueryContents = classificationQuery["contents"];

    // Send prompt to GPT-3.5 and return the result
    const output = await sendPromptDefault(classificationQueryContents + question, "gpt-3.5-turbo-1106");
    return output;
  } catch (error) {
    console.error('Error in classifyQuery:', error);
    throw error;
  }
}

/**
 * Handles data transformation and updates the data table based on Vega-Lite specifications.
 * @param {Object} view - The Vega view object containing the data.
 * @param {Object} vegaLiteSpec - The Vega-Lite specification for the chart.
 * @param {boolean} isTest - A flag indicating whether this is a test run.
 */
export function handleDataUpdate(view, vegaLiteSpec, isTest) {
  // Define continents and countries data
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
      "Argentina", "Aruba", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru",
      "Suriname", "Uruguay", "Venezuela"
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

  /**
   * Gets values for a given key from an object.
   * @param {Object} obj - The object to query.
   * @param {string} key - The key to find in the object.
   * @returns {Array} - The values associated with the key.
   */
  function getValuesForKey(obj, key) {
    return obj[key] || [];
  }

  /**
   * Finds the continent by a given country name.
   * @param {string} countryName - The name of the country.
   * @returns {string} - The continent name or "Null" if not found.
   */
  function findContinentByCountry(countryName) {
    for (const continent in continentsAndCountries) {
      if (continentsAndCountries[continent].includes(countryName)) {
        return continent;
      }
    }
    return "Null";
  }

  // Transform raw data
  const transformedData = view.data("source_0");
  const transformedDataPolished = transformedData.map((item) => {
    const newItem = {};

    for (const key in item) {
      if (key !== "Symbol(vega_id)") {
        if (key === "date") {
          // Process date field
          const date = new Date(getValuesForKey(item, key));
          const year = date.getUTCFullYear();
          const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
          const day = date.getUTCDate().toString().padStart(2, '0');
          newItem["formatted_date(Y-M-D)"] = `${year}-${month}-${day}`;
        } else if (key === "country") {
          // Process country field
          const country = getValuesForKey(item, key);
          newItem["continent"] = findContinentByCountry(country);
          newItem[key] = item[key];
        } else if (key === "inventory") {
          newItem["inventory_of_houses_for_sale"] = item[key];
        } else {
          newItem[key] = item[key];
        }
      }
    }

    // Add color information if present
    if (vegaLiteSpec.encoding.color && vegaLiteSpec.encoding.color.field) {
      const colorScale = view.scale('color');
      const colorInfo = colorScale(item[vegaLiteSpec.encoding.color.field]);
      if (item[vegaLiteSpec.encoding.color.field] !== "None") {
        newItem["Color"] = getColorName(colorInfo);
      }
    }
    return newItem;
  });

  // Send transformed data to the backend
  fetch(`${serverAddress}/api/process-json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: transformedDataPolished })
  })
    .then(response => {
      if (response.ok) {
        console.log('CSV file sent successfully!');
        if (!isTest) {
          populateTable();
        }
      } else {
        console.error('Failed to send CSV file.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });

  /**
   * Fetches and populates the data table with CSV data.
   */
  async function populateTable() {
    try {
      // Fetch CSV data
      const response = await fetch(`${serverAddress}/api/get-backend-file?file_path=data/file.csv`);
      const text = await response.json();
      const csvData = text["contents"].trim().split('\n');
      const headers = csvData.shift().split(',');

      // Initialize table
      const table = document.getElementById('csv-table');
      table.innerHTML = '';

      // Add table headers
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;

        // Add sorting functionality
        th.addEventListener('click', async () => {
          order = order === 'asc' ? 'desc' : 'asc'; // Toggle sort order
          await sortTable(header, order);
          populateTable(); // Refresh the table
        });

        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      // Determine data types for columns
      const dataType = headers.map(() => 'string');
      csvData.forEach(row => {
        row.split(',').forEach((value, index) => {
          if (!isNaN(value)) {
            dataType[index] = 'number';
          }
        });
      });

      // Add table rows
      csvData.forEach(row => {
        const rowData = row.split(',');
        const tr = document.createElement('tr');
        rowData.forEach((value, index) => {
          const td = document.createElement('td');
          td.textContent = dataType[index] === 'number' ? parseFloat(value) : value;
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
    } catch (error) {
      console.error('Error populating table:', error);
    }
  }

  /**
   * Sorts the table by a specific field and order.
   * @param {string} field - The field to sort by.
   * @param {string} order - The sort order ('asc' or 'desc').
   */
  async function sortTable(field, order) {
    try {
      const response = await fetch(`${serverAddress}/sort_csv?field=${encodeURIComponent(field)}&order=${encodeURIComponent(order)}`);
      const result = await response.json();
      if (result.message) {
        populateTable(); // Refresh the table after sorting
      }
    } catch (error) {
      console.error('Error sorting table:', error);
    }
  }

  let order = 'asc'; // Default sort order
}

// Helper Method for handleDataUpdate
// Converts Hex Code to the Closest Material Design Color Name

// Object containing Material Design color palettes
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

/**
 * Converts an RGB color string to its hexadecimal representation.
 * @param {string} rgb - The RGB color string, e.g., 'rgb(255, 0, 0)'.
 * @returns {string} - The hexadecimal color code, e.g., '#ff0000'.
 */
function rgbToHex(rgb) {
  // Extract RGB values and convert them to numbers
  const [r, g, b] = rgb.match(/\d+/g).map(Number);

  // Convert RGB to Hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Converts a hexadecimal color code to its Lab color representation.
 * @param {string} hex - The hexadecimal color code, e.g., '#ff0000'.
 * @returns {Object} - An object containing the Lab color values: { L, A, B }.
 */
function hexToLab(hex) {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16) / 255.0;
  let g = parseInt(hex.substring(3, 5), 16) / 255.0;
  let b = parseInt(hex.substring(5, 7), 16) / 255.0;

  // Convert sRGB to linear RGB
  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert linear RGB to XYZ
  r *= 100.0;
  g *= 100.0;
  b *= 100.0;

  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  // Normalize XYZ values
  const xNormalized = x / 95.047;
  const yNormalized = y / 100.0;
  const zNormalized = z / 108.883;

  // Convert XYZ to Lab
  const labX = (xNormalized > 0.008856) ? Math.cbrt(xNormalized) : (7.787 * xNormalized) + (16.0 / 116.0);
  const labY = (yNormalized > 0.008856) ? Math.cbrt(yNormalized) : (7.787 * yNormalized) + (16.0 / 116.0);
  const labZ = (zNormalized > 0.008856) ? Math.cbrt(zNormalized) : (7.787 * zNormalized) + (16.0 / 116.0);

  const L = 116.0 * labY - 16.0;
  const A = 500.0 * (labX - labY);
  const B = 200.0 * (labY - labZ);

  return { L, A, B };
}

/**
 * Finds the closest color name from a set of colors based on the given color code.
 * @param {string} colorCode - The color code in RGB or Hex format.
 * @returns {string|null} - The name of the closest color or null if no match is found.
 */
function getColorName(colorCode) {
  let hexCode = colorCode;

  // Convert RGB to Hex if necessary
  if (colorCode.startsWith('rgb')) {
    hexCode = rgbToHex(colorCode);
  }

  // Convert the color to Lab color space
  const lab1 = hexToLab(hexCode);

  let minDeltaE = Number.MAX_VALUE;
  let closestColor = null;

  // Find the closest color from predefined set
  for (const colorName in matColors) {
    if (matColors.hasOwnProperty(colorName)) {
      const shades = matColors[colorName];
      for (const shade in shades) {
        if (shades.hasOwnProperty(shade)) {
          const hex = shades[shade];
          const lab2 = hexToLab(hex);

          // Calculate the color difference (Delta E)
          const deltaL = lab1.L - lab2.L;
          const deltaA = lab1.A - lab2.A;
          const deltaB = lab1.B - lab2.B;
          const deltaE = Math.sqrt(deltaL ** 2 + deltaA ** 2 + deltaB ** 2);

          // Update the closest color if necessary
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

/**
 * Sends a question to the OpenAPI endpoint and returns the response.
 * 
 * @param {string} question - The question to send.
 * @param {string} gpt_model - The GPT model to use.
 * @returns {Promise<string>} The response from the API.
 */
export async function sendPromptDefault(question, gpt_model) {
  console.log("Prompt:", question);
  try {
    const response = await fetch(`${serverAddress}/api/prompt?question=${encodeURIComponent(question)}&gpt_model=${encodeURIComponent(gpt_model)}`, { redirect: 'manual' });
    const data = await response.json();
    console.log("Response:", data["response"]);
    return data["response"];
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Inserts a substring into a main string at a specific index.
 * 
 * @param {string} mainString - The original string.
 * @param {string} substringToInsert - The substring to insert.
 * @param {number} indexOfSubstring - The index where the substring should be inserted.
 * @param {string} mainStringAnchor - The anchor string used to locate the index.
 * @returns {string} The modified string or an error message.
 */
function insertString(mainString, substringToInsert, indexOfSubstring, mainStringAnchor) {
  if (indexOfSubstring !== -1 && indexOfSubstring < mainString.length) {
    return mainString.substring(0, indexOfSubstring + mainStringAnchor.length) +
           substringToInsert +
           mainString.substring(indexOfSubstring + mainStringAnchor.length);
  } else {
    return "Invalid index or substring not found.";
  }
}

/**
 * Generates subsequent suggestions based on the provided supplement, question, and response.
 * 
 * @param {string} supplement - Supplementary text to use in suggestions.
 * @param {string} question - The original question.
 * @param {string} response - The response to the original question.
 * @returns {Promise<string>} The generated subsequent suggestions.
 */
export async function generateSubsequentSuggestions(supplement, question, response) {
  try {
    const response = await fetch(`${serverAddress}/api/get-backend-file?file_path=gptPrompts/subsequentSuggestionPrompt.txt`, { redirect: 'manual' });
    const subsequentSuggestionsPromptRaw = await response.json();

    // Extract relevant portion from supplement
    const extractedString = supplement.match(/first child of the head:(.*?)(?=Active Element)/s)[1];
    console.log("Extracted String:", extractedString);

    // Prepare subsequent suggestions prompt
    let subsequentSuggestionsPrompt = subsequentSuggestionsPromptRaw["contents"];
    let indexOfHead = subsequentSuggestionsPrompt.indexOf("first child of the head:");
    subsequentSuggestionsPrompt = insertString(subsequentSuggestionsPrompt, extractedString, indexOfHead, "first child of the head:");

    let indexOfQuestion = subsequentSuggestionsPrompt.indexOf("a blind user asked the question:");
    subsequentSuggestionsPrompt = insertString(subsequentSuggestionsPrompt, question, indexOfQuestion, "a blind user asked the question:");

    let indexOfResponse = subsequentSuggestionsPrompt.indexOf("my application responded:");
    subsequentSuggestionsPrompt = insertString(subsequentSuggestionsPrompt, response, indexOfResponse, "my application responded:");

    // Send the updated prompt and return the output
    const output = await sendPromptDefault(subsequentSuggestionsPrompt, "gpt-3.5-turbo-1106");
    return output;
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Sends a question to a specific agent endpoint and handles the response.
 * Updates the DOM based on the response and manages loading status.
 * 
 * @param {string} supplement - Supplementary text to include in the prompt.
 * @param {string} question - The question to send.
 * @param {number} loadingAnnouncement - The interval ID for the loading announcement.
 * @param {string} classificationExplanation - Explanation of the classification.
 * @param {boolean} isTest - Indicates whether this is a test.
 * @returns {Promise<string>} The response from the agent.
 */
export async function sendPromptAgent(supplement, question, loadingAnnouncement, classificationExplanation, isTest) {
  console.log("Prompt:", supplement + question);
  if (!isTest) {
    document.getElementById("subsequentSuggestionsContainer").style.display = "none";
  }

  try {
    const response = await fetch(`${serverAddress}/api/apply-agent?question=${encodeURIComponent(supplement + question)}`, { redirect: 'manual' });
    const data = await response.json();

    if (!isTest) {
      // Update DOM elements based on response
      const loadStatus = document.getElementById("load-status");
      const loadContent = document.getElementById("load-content");
      const responseInfo = document.getElementById("response-info");

      // Clear the loading announcement
      clearInterval(loadingAnnouncement);

      // Update status and display response info
      loadStatus.innerHTML = "Response Generated";
      responseInfo.style.display = "block";
      document.getElementById("prompt").innerText = "Question: " + classificationExplanation;

      if (data.response.startsWith("The variables you mentioned") || 
          data.response.includes("I am sorry but I cannot understand the question") || 
          data.response.includes("Agent stopped due to iteration limit or time limit")) {

        document.getElementById("subsequentSuggestionsContainer").style.display = "flex";
        const output = await generateSubsequentSuggestions(supplement, question, data.response);
        console.log(output);

        const subsequentSuggestionButtons = document.getElementsByClassName("subsequentSuggestionButton");
        const questions = output.split(/Question [1-3]: /).slice(1);
        for (let i = 0; i < subsequentSuggestionButtons.length; ++i) {
          subsequentSuggestionButtons[i].innerText = questions[i];
        }
      }
    } else {
      document.getElementById("prompt").innerText = "Question: " + question;
    }

    // Display the response or an error message
    document.getElementById("response").textContent = 
      data.response !== "Agent stopped due to iteration limit or time limit."
      ? "Answer: " + data.response
      : "Answer: I'm sorry; the process has been terminated because it either took too long to arrive at an answer or your question was too long.";

    return data.response;
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Sends a navigation query to the API and returns the response.
 * 
 * @param {string} question - The question to send.
 * @returns {Promise<string>} The response from the API.
 */
export async function handleNavigationQuery(question) {
  try {
    const response = await fetch(`${serverAddress}/api/get-backend-file?file_path=gptPrompts/navigationQuery.txt`, { redirect: 'manual' });
    const navigationQuery = await response.json();

    const navigationQueryContents = navigationQuery["contents"];
    const output = await sendPromptDefault(navigationQueryContents + question, "gpt-3.5-turbo-1106");
    return output;
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Gets the active address from the hierarchy based on the active element.
 * 
 * @param {string} activeElement - The active element string.
 * @param {string} hierarchy - The hierarchy string to search in.
 * @returns {string|null} The active address or null if not found.
 */
export function getActiveAddress(activeElement, hierarchy) {
  activeElement = activeElement.replace("Press t to open table.", "").replace("1 value.", "").replace(" equals", ":");
  const firstPeriodIndex = activeElement.indexOf(".");
  const ofIndex = activeElement.indexOf(" of ");

  if (ofIndex !== -1 && firstPeriodIndex !== -1 && ofIndex < firstPeriodIndex) {
    activeElement = activeElement.slice(firstPeriodIndex + 2);
  }

  const hierarchyArray = hierarchy.split("\n");
  for (const element of hierarchyArray) {
    if (element.includes(activeElement)) {
      const index = element.indexOf("//");
      return element.substring(0, index);
    }
  }
  return null;
}

/**
 * Processes a string of instructions and summarizes them.
 * 
 * @param {string} inputString - The instructions to process.
 * @returns {Object} The processed instructions and the number of instructions.
 */
export function processInstructions(inputString) {
  // Split the input string by ". " to account for periods followed by spaces
  const instructions = inputString.split('. ').filter(instruction => instruction);
  const processedInstructions = [];
  let currentInstruction = extractDirection(instructions[0]);
  let iterationCount = 1;

  for (let i = 1; i < instructions.length; i++) {
    const instruction = extractDirection(instructions[i]);
    if (instruction === currentInstruction) {
      iterationCount++;
    } else {
      processedInstructions.push(`Press the ${currentInstruction} arrow key${iterationCount > 1 ? ` ${iterationCount} times` : ''}`);
      currentInstruction = instruction;
      iterationCount = 1;
    }
  }

  // Push the last instruction
  processedInstructions.push(`Press the ${currentInstruction} arrow key${iterationCount > 1 ? ` ${iterationCount} times` : ''}`);
  const finalString = processedInstructions.join('. ');

  return {
    final_string: finalString,
    iterationCount: processedInstructions.length,
  };
}

/**
 * Extracts the direction of the arrow key from the instruction string.
 * 
 * @param {string} instruction - The instruction string.
 * @returns {string} The direction of the arrow key.
 */
function extractDirection(instruction) {
  const match = instruction.match(/Press the (\w+) arrow key/);
  return match ? match[1] : '';
}
