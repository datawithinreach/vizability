// Helper Functions for main.js and eval/test.js

// Functions for main.js

export async function classifyQuery(question) {
  return fetch("/api/get-validation-few-shot-prompting?user_query=" + question, { redirect: 'manual' })
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



// Functions for main.js and eval/test.js

export function handleDataUpdate(view, vegaLiteSpec, isTest) {
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
          let month = date.getUTCMonth() + 1; // Months are zero-based
          let day = date.getUTCDate();
          // Add leading zero if month is a single digit
          month = month < 10 ? `0${month}` : month;

          // Add leading zero if day is a single digit
          day = day < 10 ? `0${day}` : day;

          // Create a human-readable date string
          const dateString = `${year}-${month}-${day}`;
          // newItem[key] = item[key]
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
        if (!isTest) {
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
        }


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

// const CSS21_HEX_TO_NAMES = {
//   // CSS21 Color Names and Their Hex Values
//   "#00ffff": "aqua",
//   "#000000": "black",
//   "#8a2be2": "blueviolet",
//   "#808080": "grey",
//   "#0000ff": "blue",
//   "#ff00ff": "fuchsia",
//   "#008000": "green",
//   "#00ff00": "lime",
//   "#800000": "maroon",
//   "#000080": "navy",
//   "#808000": "olive",
//   "#800080": "purple",
//   "#ff0000": "red",
//   "#c0c0c0": "silver",
//   "#008080": "teal",
//   "#ffffff": "white",
//   "#ffff00": "yellow",
//   "#ffa500": "orange",
//   "#964B00": "brown",
//   "#00ffff": "cyan",
//   "#00008b": "darkblue",
//   "#006400": "darkgreen",
//   "#556b2f": "darkolivegreen",
//   "#8b0000": "darkred",
//   "#add8e6": "lightblue",
//   "#ffb6c1": "lightpink",
//   "#90ee90": "lightgreen",
//   "#ff4500": "orangered"
// };

// function hexToLab(hex) {
//   // Convert HEX to RGB
//   let r = parseInt(hex.substring(1, 3), 16);
//   let g = parseInt(hex.substring(3, 5), 16);
//   let b = parseInt(hex.substring(5, 7), 16);

//   // Convert RGB to XYZ
//   r /= 255.0;
//   g /= 255.0;
//   b /= 255.0;

//   if (r > 0.04045) {
//     r = Math.pow((r + 0.055) / 1.055, 2.4);
//   } else {
//     r = r / 12.92;
//   }
//   if (g > 0.04045) {
//     g = Math.pow((g + 0.055) / 1.055, 2.4);
//   } else {
//     g = g / 12.92;
//   }
//   if (b > 0.04045) {
//     b = Math.pow((b + 0.055) / 1.055, 2.4);
//   } else {
//     b = b / 12.92;
//   }

//   r *= 100.0;
//   g *= 100.0;
//   b *= 100.0;

//   let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
//   let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
//   let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

//   // Convert XYZ to LAB
//   x /= 95.047;
//   y /= 100.0;
//   z /= 108.883;

//   if (x > 0.008856) {
//     x = Math.pow(x, 1.0 / 3.0);
//   } else {
//     x = 7.787 * x + 16.0 / 116.0;
//   }
//   if (y > 0.008856) {
//     y = Math.pow(y, 1.0 / 3.0);
//   } else {
//     y = 7.787 * y + 16.0 / 116.0;
//   }
//   if (z > 0.008856) {
//     z = Math.pow(z, 1.0 / 3.0);
//   } else {
//     z = 7.787 * z + 16.0 / 116.0;
//   }

//   const L = 116.0 * y - 16.0;
//   const A = 500.0 * (x - y);
//   const B = 200.0 * (y - z);

//   return { L, A, B };
// }

// function getColorName(hexCode) {
//   const lab1 = hexToLab(hexCode);
//   let minDeltaE = Number.MAX_VALUE;
//   let closestColor = null;

//   for (const hex in CSS21_HEX_TO_NAMES) {
//     if (CSS21_HEX_TO_NAMES.hasOwnProperty(hex)) {
//       const lab2 = hexToLab(hex);
//       const deltaL = lab1.L - lab2.L;
//       const deltaA = lab1.A - lab2.A;
//       const deltaB = lab1.B - lab2.B;

//       const deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);

//       if (deltaE < minDeltaE) {
//         minDeltaE = deltaE;
//         closestColor = CSS21_HEX_TO_NAMES[hex];
//       }
//     }
//   }

//   return closestColor;
// }
// function getColorName(input) {
//   const CSS21_HEX_TO_NAMES = {
//     // CSS21 Color Names and Their Hex Values
//     "#00ffff": "aqua",
//     "#000000": "black",
//     "#8a2be2": "blueviolet",
//     "#808080": "grey",
//     "#0000ff": "blue",
//     "#ff00ff": "fuchsia",
//     "#008000": "green",
//     "#00ff00": "lime",
//     "#800000": "maroon",
//     "#000080": "navy",
//     "#808000": "olive",
//     "#800080": "purple",
//     "#ff0000": "red",
//     "#c0c0c0": "silver",
//     "#008080": "teal",
//     "#ffffff": "white",
//     "#ffff00": "yellow",
//     "#ffa500": "orange",
//     "#964B00": "brown",
//     "#00ffff": "cyan",
//     "#00008b": "darkblue",
//     "#006400": "darkgreen",
//     "#556b2f": "darkolivegreen",
//     "#8b0000": "darkred",
//     "#add8e6": "lightblue",
//     "#ffb6c1": "lightpink",
//     "#90ee90": "lightgreen",
//     "#ff4500": "orangered"
//   };

//   function hexToRgb(hex) {
//     // Convert a Hexadecimal Color String to an RGB Triplet
//     const r = parseInt(hex.slice(1, 3), 16);
//     const g = parseInt(hex.slice(3, 5), 16);
//     const b = parseInt(hex.slice(5, 7), 16);
//     return [r, g, b];
//   }

//   const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i;
//   let rgbTriplet = null;
//   if (!rgbRegex.test(input)) {
//     rgbTriplet = hexToRgb(input);
//   } else {
//     rgbTriplet = input
//       .substring(4, input.length - 1)
//       .split(",")
//       .map(value => parseInt(value.trim(), 10));
//   }

//   const minColours = {};
//   for (const key in CSS21_HEX_TO_NAMES) {
//     const name = CSS21_HEX_TO_NAMES[key];
//     const [rC, gC, bC] = hexToRgb(key);
//     const rd = Math.pow(rC - rgbTriplet[0], 2);
//     const gd = Math.pow(gC - rgbTriplet[1], 2);
//     const bd = Math.pow(bC - rgbTriplet[2], 2);
//     minColours[rd + gd + bd] = name;
//   }

//   const minDistance = Math.min(...Object.keys(minColours));
//   return minColours[minDistance];
// }

// Sends Question to OpenAPI and Casts Output Answer to DOM Elements
// No Specific Agent is Used
export async function sendPromptDefault(question, gpt_model) {
  console.log("prompt", question);
  return fetch("/api/prompt?question=" + question + "&gpt_model=" + gpt_model, { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("response", data["response"]);
      return data["response"];
    });
}

// export async function sendPromptEvaluation(question) {
//   console.log("prompt", question);
//   return fetch("/api/prompt-gpt4?question=" + question, { redirect: 'manual' })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {
//       console.log("response", data["response"]);
//       return data["response"];
//     })
// }

function insertString(mainString, substringToInsert, indexOfSubstring, mainStringAnchor) {
  if (indexOfSubstring !== -1 && indexOfSubstring < mainString.length) {
    let modifiedString =
      mainString.substring(0, indexOfSubstring + mainStringAnchor.length) +
      substringToInsert +
      mainString.substring(indexOfSubstring + mainStringAnchor.length);

    return modifiedString;
  } else {
    return "Invalid index or substring not found.";
  }
}


export async function generateSubsequentSuggestions(supplement, question, response) {
  return fetch("/api/get-backend-file?file_path=gptPrompts/subsequentSuggestionPrompt.txt", { redirect: 'manual' })
    .then(function (response) {
      return response.json();
    })
    .then(async function (subsequentSuggestionsPromptRaw) {
      let extractedString = supplement.match(/first child of the head:(.*?)(?=Active Element)/s)[1];
      console.log("EXTRACTED", extractedString);

      var subsequentSuggestionsPrompt = subsequentSuggestionsPromptRaw["contents"];
      let indexOfHead = subsequentSuggestionsPrompt.indexOf("first child of the head:");
      subsequentSuggestionsPrompt = insertString(subsequentSuggestionsPrompt, extractedString, indexOfHead, "first child of the head:");
      let indexOfQuestion = subsequentSuggestionsPrompt.indexOf("a blind user asked the question:");
      subsequentSuggestionsPrompt = insertString(subsequentSuggestionsPrompt, question, indexOfQuestion, "a blind user asked the question:")
      let indexOfResponse = subsequentSuggestionsPrompt.indexOf("my application responded:");
      subsequentSuggestionsPrompt = insertString(subsequentSuggestionsPrompt, response, indexOfResponse, "my application responded:");
      // console.log(subsequentSuggestionsPrompt);
      return sendPromptDefault(subsequentSuggestionsPrompt, "gpt-3.5-turbo-1106")
        .then(function (output) {
          return output; // Return the output value if needed for further processing
        })
        .catch(function (error) {
          console.error(error);
        });
    })
}

// Sends Question to OpenAPI and Casts Output Answer to DOM Elements
// LLM Uses a Specific CSV Agent
export async function sendPromptAgent(supplement, question, loadingAnnouncement, classificationExplanation, isTest) {
  console.log("prompt", supplement + question);
  if (!isTest) {
    document.getElementById("subsequentSuggestionsContainer").style.display = "none";
  }
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

        if (data.response.startsWith("The variables you mentioned") || data.response.includes("I am sorry but I cannot understand the question") || data.response.includes("Agent stopped due to iteration limit or time limit")) {
          document.getElementById("subsequentSuggestionsContainer").style.display = "flex";
          generateSubsequentSuggestions(supplement, question, data.response)
            .then(function (output) {
              console.log(output);
              const subsequentSuggestionButtons = document.getElementsByClassName("subsequentSuggestionButton");
              const questions = output.split(/Question [1-3]: /).slice(1);
              for (var i = 0; i < subsequentSuggestionButtons.length; ++i) {
                subsequentSuggestionButtons[i].innerText = questions[i];
              }
            });
        }
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

      return sendPromptDefault(navigationQueryContents + question, "gpt-3.5-turbo-1106")
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
