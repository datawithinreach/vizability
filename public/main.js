// use fetch to send a request to the backend /prompt with the parameter text 
// and display the text in the div with id="prompt"
// and then display the response in the div with id="response"

import Tree from "./tree.js"

// sends question to OpenAPI and casts output answer to DOM elements

function handleSubmit(event, hierarchy) {
  event.preventDefault();
  var question = document.getElementById("user-query");
  const supplement = descrPre + hierarchy + descrPost;
  console.log("sending the question to the server", supplement + question.value);

  classifyQuery(question.value).then(function (queryType) {
    console.log(queryType);
    if (queryType.includes("Analytical Query")) {
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
    else if (queryType.includes("Visual Query")) {
      // implement later
      // use Vega View API
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
  return fetch("/api/get-query-classification?question=" + question, { redirect: 'manual' })
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
let vlSpec = "";

const contextArray = [];
const stringDescr = "Below is the JSON data for a graph. Use it to answer the following question. \n"

var ariaLevel = 1;

const descrPre = "Here's a description of a data set. It is a hierarchy, where each sentence is preceded by its ranking (for instance: 1a or 3b):\n";
const descrPost = "Use this information along with everything else you are given to answer the following question: \n";


const handleVegaLiteSpecChange = (event) => {
  // Update the vegaLiteSpec variable with the new value
  vlSpec = JSON.parse(event.detail);

  const vegaSpec = vegaLite.compile(vlSpec).spec;
  const runtime = vega.parse(vegaSpec);
  const vegaContainer = document.getElementById("vega-container");
  const view = new vega.View(runtime)
    .logLevel(vega.Warn)
    .initialize(vegaContainer)
    .renderer("svg")
    .hover()
    .run();

  // code to render the olli treeview
  const olliContainer = document.getElementById("olli-container");

  OlliAdapters.VegaLiteAdapter(vlSpec).then((olliVisSpec) => {
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
    myJSON = stringifyContextArray();
  });


  tree = new Tree(document.querySelector('.olli-vis'));
  // tree.getHierarchy((hierarchy) => {
  //   descr = descrPre + hierarchy;
  // });
};

document.addEventListener('vegaLiteSpecChange', handleVegaLiteSpecChange);

// Attach the submit event listener outside of handleVegaLiteSpecChange
document.getElementById("ask-question").addEventListener('submit', (event) => {
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
