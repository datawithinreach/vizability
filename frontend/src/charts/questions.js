const bar = [
  // {
  //   prompt: "How many days of sun are there in October?",
  //   type: "radiogroup",
  //   response: "",
  //   answer: "37",
  //   options: [
  //     "12",
  //     "5",
  //     "37",
  //     "Unable to extract information",
  //     "None of the above is the correct answer",
  //   ],
  // },
  {
    prompt:
      "In which month, was the highest count of days for a single weather type observed?",
    type: "radiogroup",
    response: "",
    answer: "July",
    options: [
      "September",
      "July",
      "May",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Which month has the fewest rain days?",
    type: "radiogroup",
    response: "",
    answer: "July",
    options: [
      "July",
      "May",
      "September",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Were there more days with rain in March or in September?",
    type: "radiogroup",
    response: "",
    answer: "More rain days in March",
    options: [
      "They are the same",
      "More rain days in March",
      "More rain days in September",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "In September, were there more days of sun or days with rain?",
    type: "radiogroup",
    response: "",
    answer: "More sunny days",
    options: [
      "They are the same",
      "More rainy days",
      "More sunny days",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt:
      "What is the average number of days with sun? Please try to choose the closest answer.",
    type: "radiogroup",
    response: "",
    answer: "53",
    options: [
      "35",
      "44",
      "53",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "What is the overall trend of days with rain?",
    type: "radiogroup",
    response: "",
    answer: "It increases toward the winter",
    options: [
      "It remains steady throughout the year",
      "It increases toward the summer",
      "It increases toward the winter",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Imagine you are summarizing the chart and its data for your colleague. Interpret the data and write about the main takeaway insights and conclusions. You can go back to the chart and further improve your understanding of the overall message.",
    type: "comment",
    minimum: 150,
    response: "",
    answer: "",
  },
];

const line = [
  // {
  //   prompt: "What is the price of a Microsoft stock in 2003?",
  //   type: "radiogroup",
  //   response: "",
  //   answer: "20.93",
  //   options: [
  //     "77.31",
  //     "20.93",
  //     "50.56",
  //     "Unable to extract information",
  //     "None of the above is the correct answer",
  //   ],
  // },
  {
    prompt: "In which year was the highest price for a share reached?",
    type: "radiogroup",
    response: "",
    answer: "2007",
    options: [
      "2007",
      "2009",
      "2004",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "In which year did Amazon stock reach the lowest price?",
    type: "radiogroup",
    response: "",
    answer: "2001",
    options: [
      "2005",
      "2003",
      "2001",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Which company has a higher stock price in 2003, Amazon or IBM?",
    type: "radiogroup",
    response: "",
    answer: "IBM",
    options: [
      "They are the same",
      "Amazon",
      "IBM",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Which year has a higher stock price for Microsoft, 2007 or 2009?",
    type: "radiogroup",
    response: "",
    answer: "2007",
    options: [
      "They were the same",
      "2007",
      "2009",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "What is the median stock price of Google?",
    description:
      "The median of a dataset is the middle value. If there is an even number of data points, the median is the average of the two middle values",
    type: "radiogroup",
    response: "",
    answer: "449.92",
    options: [
      "485.32",
      "449.92",
      "410.85",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "What is the trend of Microsoft's stock price over the years?",
    type: "radiogroup",
    response: "",
    answer: "Stays about the same",
    options: [
      "Increasing over time",
      "Decreasing over time",
      "Stays about the same",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Imagine you are summarizing the chart and its data for your colleague. Interpret the data and write about the main takeaway insights and conclusions. You can go back to the chart and further improve your understanding of the overall message.",
    type: "comment",
    minimum: 150,
    response: "",
    answer: "",
  },
];

const scatter = [
  // {
  //   prompt: "What is the life expectancy in Hungary?",
  //   type: "radiogroup",
  //   response: "",
  //   answer: "76 years",
  //   options: [
  //     "86 years",
  //     "66 years",
  //     "Unable to extract information",
  //     "None of the above is the correct answer",
  //   ],
  // },
  {
    prompt: "Which country has the highest income?",
    type: "radiogroup",
    response: "",
    answer: "Luxembourg",
    options: [
      "Japan",
      "Luxembourg",
      "Norway",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Which country has the highest life expectancy in America?",
    type: "radiogroup",
    response: "",
    answer: "Canada",
    options: [
      "Chile",
      "Canada",
      "United States",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Which country's life expectancy is higher, Austria or Germany?",
    type: "radiogroup",
    response: "",
    answer: "They are the same",
    options: [
      "They are the same",
      "Austria",
      "Germany",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt:
      "Which continent's highest income country has longer life expectancy, America or Europe?",
    type: "radiogroup",
    response: "",
    answer: "Europe",
    options: [
      "They are the same",
      "America",
      "Europe",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt:
      "What is the average life expectancy of countries in Asia? Please try to choose the closest answer.",
    type: "radiogroup",
    response: "",
    answer: "81.6",
    options: [
      "76.7",
      "81.6",
      "86.8",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "What is the relationship between income and life expectancy?",
    type: "radiogroup",
    response: "",
    answer: "Living longer is related to a higher income.",
    options: [
      "Living longer is related to a higher income.",
      "Living longer is related to a lower income.",
      "Living longer is not related to income.",
      "None of the above is the correct answer",
      "Unable to extract information",
    ],
  },
  {
    prompt: "Imagine you are summarizing the chart and its data for your colleague. Interpret the data and write about the main takeaway insights and conclusions. You can go back to the chart and further improve your understanding of the overall message.",
    type: "comment",
    minimum: 150,
    response: "",
    answer: "",
  },
];

const map = [
  // {
  //   prompt: "What is the vaccination rate in Alaska?",
  //   type: "radiogroup",
  //   response: "",
  //   answer: "62.77%",
  //   options: [
  //     "62.77%",
  //     "64.14%",
  //     "60.68%",
  //     "Unable to extract information",
  //     "None of the above is the correct answer",
  //   ],
  // },
  {
    prompt: "Which state has the lowest vaccination rate?",
    type: "radiogroup",
    response: "",
    answer: "Wyoming",
    options: [
      "Texas",
      "Wyoming",
      "West Virginia",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Which state has the highest vaccination rate?",
    type: "radiogroup",
    response: "",
    answer: "Rhode Island",
    options: [
      "Rhode Island",
      "Massachusetts",
      "New Jersey",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Which state's vaccination rate is higher, New York or California?",
    type: "radiogroup",
    response: "",
    answer: "New York",
    options: [
      "They are the same",
      "New York",
      "California",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Which state's vaccination rate is lower, Texas or Florida?",
    type: "radiogroup",
    response: "",
    answer: "Texas",
    options: [
      "They are the same",
      "Texas",
      "Florida",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },

  {
    prompt: "What is the median vaccination rate?",
    description:
      "The median of a dataset is the middle value. If there is an even number of data points, the median is the average of the two middle values",
    type: "radiogroup",
    response: "",
    answer: "62.72%",
    options: [
      "62.72%",
      "57.34%",
      "67.84%",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt:
      "What is the average vaccination rate? Please try to choose the closest answer.",
    type: "radiogroup",
    response: "",
    answer: "65.42%",
    options: [
      "71.75%",
      "59.95%",
      "65.42%",
      "None of the above is the correct answer",
      "Unable to extract information",
      
    ],
  },
  {
    prompt: "Imagine you are summarizing the chart and its data for your colleague. Interpret the data and write about the main takeaway insights and conclusions. You can go back to the chart and further improve your understanding of the overall message.",
    type: "comment",
    minimum: 150,
    response: "",
    answer: "",
  },
];

export const taskQuestions = {
  bar,
  line,
  scatter,
  map,
};
