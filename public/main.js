import { handleDataUpdate, sendPromptAgent, sendPromptDefault, classifyQuery, handleNavigationQuery, getActiveAddress } from "./helperFunctions.js";
import { CondensedOlliRender } from "./condenseOlliRender.js";

// Initialize All Global Variables
let activeElement = '';
let tree;
let vegaLiteSpec = "";

// STEP 1 -> Load VegaLite Spec and Olli Treeview

// Function to Handle Loading in VegaLite Spec
const handleVegaLiteSpecChange = async function (event) {
  // Update the vegaLiteSpec variable with the new value
  vegaLiteSpec = await JSON.parse(event.detail);

  // DOM Element Container that Houses VegaLite SVG
  const vegaContainer = document.getElementById("vega-container");

  // Initialize View
  const vegaLiteSpecCompiled = vegaLite.compile(vegaLiteSpec).spec
  const view = await new vega.View(vega.parse(vegaLiteSpecCompiled))
    .logLevel(vega.Warn)
    .initialize(vegaContainer)
    .renderer("svg")
    .hover()
    .runAsync();

  // Get Transformed Data
  handleDataUpdate(view, vegaLiteSpec);

  // Add Event Listener For Slider Changes
  // Updates Transformed Data
  const sliderInput = document.querySelector('input[type="range"]');
  if (sliderInput) {
    const parameterName = sliderInput.getAttribute("name");
    sliderInput.addEventListener("input", () => {
      view.signal(parameterName, parseInt(sliderInput.value, 10)).runAsync();
      handleDataUpdate(view, vegaLiteSpec);
    });
  }

  // Code to Render the Olli Treeview
  const olliContainer = document.getElementById("olli-container");

  // Add an Event Listener to olliContainer to Gauge Active Element
  olliContainer.addEventListener('keyup', function (event) {
    activeElement = event.srcElement.firstChild.innerText;
  });

  OlliAdapters.VegaLiteAdapter(vegaLiteSpec).then((olliVisSpec) => {
    const olliRender = olli(olliVisSpec);
    olliContainer.innerHTML = "";
    olliContainer.append(olliRender);

    // Hierarchical Tree Representation of Olli Treeview
    tree = new CondensedOlliRender(document.querySelector('.olli-vis'));
  });

};

// Initialize Event Listener for Loading in VegaLite Spec
document.addEventListener('vegaLiteSpecChange', handleVegaLiteSpecChange);



// STEP 2 -> OpenAPI Question and Answer Integration

// Attach the Submit Event Listener Outside of handleVegaLiteSpecChange
// Handles User QnA
document.getElementById("ask-question").addEventListener('submit', (event) => {
  event.preventDefault();

  // Obtain Hierarchical String Representation of Olli Treeview
  const condensedString = tree.getCondensedString();

  // Triggers when User Submits Question; Provides Response through OpenAPI
  handleSubmit(event, condensedString);
});

function handleSubmit(event, hierarchy) {
  event.preventDefault();

  // Initialize Variables
  const filePath = "gptPrompts/queryClassification.txt";

  const descrPre = "Here's a description of a data set. It is a hierarchy/tree data structure, where each sentence is preceded by its placement within the tree. For instance, 1.1.2 refers to the second child of the first child of the head:\n";
  const descrPost = "Use this information along with everything else you are given to answer the following question: \n";
  const supplement = descrPre + hierarchy + descrPost;

  const question = document.getElementById("user-query");
  console.log("sending the question to the server", supplement + question.value);

  // Classify User Question
  // Classification Categories Include: Analytical Query; Visual Query; Contextual Query; Navigation Query
  classifyQuery(question.value).then(function (queryType) {
    // Apply Answering Pipeline Based on Classification Response
    if (queryType.includes("Analytical Query") || queryType.includes("Visual Query")) {
      sendPromptAgent(supplement, question.value);
      question.value = '';
    }
    else if (queryType.includes("Contextual Query")) {
      sendPromptDefault(question.value).then(function (response) {
        document.getElementById("prompt").textContent = question.value;
        document.getElementById("response").textContent = response;
        question.value = '';
      });
    }
    else if (queryType.includes("Navigation Query")) {
      // Provide Context to OpenAPI about User's Current Position within the Olli Treeview
      const activeAddress = getActiveAddress(activeElement, hierarchy);
      const activeElementString = " In case the current position is not stated in the question, it is this: " + activeAddress;

      // Packaged Question to be Sent to OpenAPI
      const navigationQuestion = supplement + question.value + activeElementString;

      // Answer Navigation Query
      handleNavigationQuery(navigationQuestion).then(function (response) {
        document.getElementById("prompt").textContent = question.value;
        document.getElementById("response").textContent = response;
        question.value = '';
      });
    }
    // Query Cannot be Classified by LLM
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



// // sends question to OpenAPI for classification and returns output string
// async function classificationQueryAndNavigationQuery(question, filePath) {
//   return fetch("/api/get-backend-file?file_path=" + filePath, { redirect: 'manual' })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(async function (Query) {
//       var queryContents = Query["contents"];

//       return sendPromptDefault(queryContents + question)
//         .then(function (output) {
//           return output; // Return the output value if needed for further processing
//         })
//         .catch(function (error) {
//           console.error(error);
//         });
//     });
// }
