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

  // Add an Event Listener to olliContainer to Gauge Active Element
  olliContainer.addEventListener('keyup', function (event) {
    activeElement = event.srcElement.firstChild.innerText;
  });

  OlliAdapters.VegaLiteAdapter(vegaLiteSpec).then((olliVisSpec) => {
    const olliRender = olli(olliVisSpec);
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

  const loadContent = document.getElementById("load-content");
  const loadStatus = document.getElementById("load-status");
  const responseInfo = document.getElementById("response-info");

  // Step 1
  responseInfo.style.display = "none";

  // Step 2
  loadStatus.innerHTML = "Working. Please Wait";
  loadStatus.style.display = "block";

  // Step 3
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
    let classificationExplanation = "";
    if (queryType.includes("Analytical Query") || queryType.includes("Visual Query")) {
      classificationExplanation = "Your question \"" + question.value + "\" was categorized as being data-driven, and as such, has been answered based on the data in the chart.";
      sendPromptAgent(supplement, question.value, loadingAnnouncement, classificationExplanation);
      question.removeAttribute("aria-live");
      question.value = '';
    }
    else if (queryType.includes("Contextual Query")) {
      sendPromptDefault(question.value).then(function (response) {
        classificationExplanation = "Your question \"" + question.value + "\" was categorized as being context-seeking, and as such, has been answered based on information found on the web.";

        const loadStatus = document.getElementById("load-status");
        const loadContent = document.getElementById("load-content");
        const responseInfo = document.getElementById("response-info");

        // Clear the loading announcement
        clearInterval(loadingAnnouncement);

        // Step 4
        loadStatus.innerHTML = "Response Generated";

        // Step 5
        responseInfo.style.display = "block";
        
        document.getElementById("prompt").textContent = "Question: " + classificationExplanation;
        document.getElementById("response").textContent = "Answer: " + response;
        question.removeAttribute("aria-live");
        question.value = '';
      });
    }
    else if (queryType.includes("Navigation Query")) {
      // Provide Context to OpenAPI about User's Current Position within the Olli Treeview
      const activeAddress = getActiveAddress(activeElement, hierarchy);
      const activeElementString = " In case the current position is not stated in the question, it is this: " + activeAddress;

      // Packaged Question to be Sent to OpenAPI
      const navigationQuestion = supplement + question.value + activeElementString;
      const classificationExplanation = "Your question \"" + question.value + "\" was categorized as being related to navigating the chart structure, and as such has been answered based on the treeview.";
      const loadStatus = document.getElementById("load-status");
      const loadContent = document.getElementById("load-content");
      const responseInfo = document.getElementById("response-info");

      // Answer Navigation Query
      handleNavigationQuery(navigationQuestion).then(function (response) {
        // Clear the loading announcement
        clearInterval(loadingAnnouncement);

        // Step 4
        loadStatus.innerHTML = "Response Generated";

        // Step 5
        responseInfo.style.display = "block";
        document.getElementById("prompt").textContent = "Question: " + classificationExplanation;
        document.getElementById("response").textContent = "Answer: " + response;
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

      // Step 4
      loadStatus.innerHTML = "Response Generated";

      // Step 5
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
