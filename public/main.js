import { handleDataUpdate, sendPromptAgent, sendPromptDefault, classifyQuery, handleNavigationQuery } from "./helperFunctions.js";
import { CondensedOlliRender } from "./condenseOlliRender.js";
import { Stack } from "./stack.js";

// Initialize All Global Variables
let activeElement = '';
let activeElementNode = null;
let activeElementNodeAddress = null;
let activeElementNodeInnerText = null;
let tree;
let vegaLiteSpec = "";
const isTest = false;


// STEP 1 -> Load VegaLite Spec and Olli Treeview


// Function to Handle Loading in VegaLite Spec
const handleVegaLiteSpecChange = async function (event) {
  // Update the vegaLiteSpec variable with the new value

  if (typeof event.detail === "string") {
    vegaLiteSpec = await JSON.parse(event.detail);
  }
  else {
    vegaLiteSpec = event.detail;
  }

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


  // STEP 1.5 -> Check for User Keyboard Navigation of the Olli Treeview


  // Stack used to Track Active Elements within Treeview
  const activeElementStack = new Stack();

  function setUpEventListener(olliContainer, activeElementStack) {
    function nestedEventListener(event) { 
      event.stopImmediatePropagation(); // necessary to prevent the creation of subsequent nested event listeners
      activeElement = event.srcElement.firstChild.innerText;

      // Retrieve Active Element Node Object from activeElement Variable
      const index = tree.getTreeItemArray().findIndex(obj => obj.getInnerText() === activeElement);
      activeElementNode = tree.getTreeItemArray()[index];
      activeElementNodeAddress = activeElementNode.getAddress();
      activeElementNodeInnerText = activeElementNode.getInnerText();

      // Check for Up Arrow KeyUp
      if (event.keyCode === 38) {
        const previousElement = activeElementStack.peek();
        let correspondingElement = null;

        // Get Previous Element Node Object
        tree.getTreeItemArray().forEach(element => {
          if (element.getInnerText() == previousElement.getInnerText()) {
            correspondingElement = element;
          }
          // Reset Active Child for Selected Echelon of the Treeview
          if (element.getAddress().slice(0, -1) == previousElement.getAddress().slice(0, -1)) {
            element.setIsActiveChild(false);
          }
        });
        // Set Current Active Child
        correspondingElement.setIsActiveChild(true);
      }

      // Check for Left/Right Arrow KeyUp
      // Reset Active Child for Selected Echelon of the Treeview
      // Set Current Active Child for Selected Echelon of the Treeview
      else if (event.keyCode === 37 || event.keyCode === 39) {
        tree.getTreeItemArray().forEach(element => {
          if (element.getAddress().slice(0, -1) == activeElementNode.getAddress().slice(0, -1)) {
            element.setIsActiveChild(false);
          }
        })
        activeElementNode.setIsActiveChild(true);
      }

      activeElementStack.push(activeElementNode);
    }
    
    olliContainer.addEventListener('keyup', nestedEventListener);
  }
  console.log(vegaLiteSpec);
  OlliAdapters.VegaLiteAdapter(vegaLiteSpec).then((olliVisSpec) => {
    console.log(olliVisSpec);
    
    const olliRender = olli(olliVisSpec);
    console.log(olliRender);
    olliContainer.innerHTML = "";
    // Create the <p> element
    var olliInfo = document.createElement("p");
    olliInfo.id = "olli-instructions";
    olliInfo.setAttribute("role", "region");
    olliInfo.setAttribute("tabindex", "0");

    var strongElement = document.createElement("strong");
    strongElement.textContent = "Explore the structure and components of the chart through a text representation.\nInstructions: Press enter on the treeview to explore the contents of the chart. Navigate using the arrows keys. To exit, press escape.";

    // Append the <strong> element to the <p> element
    olliInfo.appendChild(strongElement);

    olliContainer.append(olliInfo);
    olliInfo.focus();
    olliContainer.append(olliRender);

    // Hierarchical Tree Representation of Olli Treeview
    tree = new CondensedOlliRender(document.querySelector('.olli-vis'));

    setUpEventListener(olliContainer, activeElementStack);
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

  // Handle Accessiblity and User Interface Cues
  const loadStatus = document.getElementById("load-status");
  const responseInfo = document.getElementById("response-info");

  responseInfo.style.display = "none";

  loadStatus.innerHTML = "Working. Please Wait";
  loadStatus.style.display = "block";

  const loadingAnnouncement = setInterval(() => {
    loadStatus.innerHTML = "Still Loading";
    loadStatus.style.display = "block";
  }, 3000);

  // Triggers when User Submits Question; Provides Response through OpenAPI
  handleSubmit(event, condensedString, loadingAnnouncement);
});

function handleSubmit(event, hierarchy, loadingAnnouncement) {
  event.preventDefault();

  // Initialize Variables
  const descrPre = "\nHere's a description of a data set. It is a hierarchy/tree data structure, where each sentence is preceded by its placement within the tree. For instance, 1.1.2 refers to the second child of the first child of the head:\n";
  const descrPost = "\nMake sure to format all numerical responses appropriately, using things such as commas, dollar signs, appropriate rounding, and other identifiers when necessary. Your answers should be verbose and must repeat the question. Your answers must include all UNIX timestamps as calendar dates. If the question itself is too ambiguous or references data that you are not given, respond with \"I am sorry but I cannot understand the question\" and nothing more. Use this information along with everything else you are given to answer the following question: \n";
  const supplement = descrPre + hierarchy + "The current address is: " + (activeElementNodeAddress + " // " + activeElementNodeInnerText) + descrPost;

  const question = document.getElementById("user-query");
  console.log("sending the question to the server", supplement + question.value);

  // Classify User Question
  // Classification Categories Include: Analytical Query; Visual Query; Contextual Query; Navigation Query
  classifyQuery(question.value).then(function (queryType) {
    // Apply Answering Pipeline Based on Classification Response
    let classificationExplanation = "";
    if (queryType.includes("Analytical Query") || queryType.includes("Visual Query")) {
      classificationExplanation = "Your question \"" + question.value + "\" was categorized as being data-driven, and as such, has been answered based on the data in the chart.";
      sendPromptAgent(supplement, question.value, loadingAnnouncement, classificationExplanation, isTest);
      question.removeAttribute("aria-live");
      question.value = '';
    }
    else if (queryType.includes("Contextual Query")) {
      sendPromptDefault(question.value).then(function (response) {
        classificationExplanation = "Your question \"" + question.value + "\" was categorized as being context-seeking, and as such, has been answered based on information found on the web.";

        const loadStatus = document.getElementById("load-status");
        const responseInfo = document.getElementById("response-info");

        // Clear the loading announcement
        clearInterval(loadingAnnouncement);

        loadStatus.innerHTML = "Response Generated";
        responseInfo.style.display = "block";

        document.getElementById("prompt").textContent = "Question: " + classificationExplanation;
        (response != "Agent stopped due to iteration limit or time limit.") ? document.getElementById("response").textContent = "Answer: " + response : document.getElementById("response").textContent = "Answer: I'm sorry; the process has been terminated because it took too long to arrive at an answer.";
        question.removeAttribute("aria-live");
        question.value = '';
      });
    }
    else if (queryType.includes("Navigation Query")) {
      // Provide Context to OpenAPI about User's Current Position within the Olli Treeview

      // Packaged Question to be Sent to OpenAPI
      const navigationQuestion = supplement + question.value;
      const classificationExplanation = "Your question \"" + question.value + "\" was categorized as being related to navigating the chart structure, and as such has been answered based on the treeview.";
      const loadStatus = document.getElementById("load-status");
      const responseInfo = document.getElementById("response-info");

      // Answer Navigation Query
      handleNavigationQuery(navigationQuestion).then(function (response) {
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
          let startNode = tree.getNodeFromAddress(startingAddress);
          navigationResponse = tree.getShortestPath(startNode, endNode);
        }
        else {
          if (startingAddressMatch) {
            startingAddress = startingAddressMatch[1];
            const startingNode = tree.getNodeFromAddress(startingAddress);
            navigationResponse = "Current Position: " + startingNode.getInnerText();
          }
          else {
            navigationResponse = "The question was interpreted as involving navigation but either no starting/ending point was provided or the Treeview was not activated. Please try again.";
          }          
        }
        

        // Clear the loading announcement
        clearInterval(loadingAnnouncement);
        loadStatus.innerHTML = "Response Generated";
        responseInfo.style.display = "block";
        document.getElementById("prompt").textContent = "Question: " + classificationExplanation;
        document.getElementById("response").textContent = "Answer: " + navigationResponse;
        question.removeAttribute("aria-live");
        question.value = '';
      });
    }
    // Query Cannot be Classified by LLM
    else {
      classificationExplanation = "Your question \"" + question.value + "\" could not be properly categorized.";
      const loadStatus = document.getElementById("load-status");
      const loadContent = document.getElementById("load-content");
      const responseInfo = document.getElementById("response-info");

      // Clear the loading announcement
      clearInterval(loadingAnnouncement);

      loadStatus.innerHTML = "Response Generated";
      responseInfo.style.display = "block";

      document.getElementById("prompt").textContent = classificationExplanation;
      document.getElementById("response").textContent = queryType;
      question.removeAttribute("aria-live");
      question.value = '';
    }
  })
    .catch(function (error) {
      console.error(error); // Handle any errors that occurred during the promise
    });
}
