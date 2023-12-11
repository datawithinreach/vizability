import { handleDataUpdate, sendPromptAgent, sendPromptDefault, classifyQuery, handleNavigationQuery, processInstructions, generateSubsequentSuggestions } from "./helperFunctions.js";
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


// Load VegaLite Spec and Keyboard Navigable Chart Representation

// Toggle between different keyboard navigable chart representations
document.getElementById("toggle-olli").addEventListener("click", (event) => {
  document.getElementById("olli-container").classList.remove("hidden");
  document.getElementById("table-container").classList.add("hidden");
});
document.getElementById("toggle-table").addEventListener("click", (event) => {
  document.getElementById("table-container").classList.remove("hidden");
  document.getElementById("olli-container").classList.add("hidden");
});


// Function to Handle Loading in VegaLite Spec
const handleVegaLiteSpecChange = async function (event) {
  // Update the vegaLiteSpec variable with the new value
  vegaLiteSpec = event.detail;


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
  handleDataUpdate(view, vegaLiteSpec, false);

  // Add Event Listener For Slider Changes
  // Updates Transformed Data
  const sliderInput = document.querySelector('input[type="range"]');
  if (sliderInput) {
    const parameterName = sliderInput.getAttribute("name");
    sliderInput.addEventListener("input", () => {
      view.signal(parameterName, parseInt(sliderInput.value, 10)).runAsync();
      handleDataUpdate(view, vegaLiteSpec, false);
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
        const previousElement = activeElementStack.peek(); // returns only the text of previous element
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

  OlliAdapters.VegaLiteAdapter(vegaLiteSpec).then((olliVisSpec) => {
    const olliRender = olli(olliVisSpec);
    console.log(olliRender);
    olliContainer.innerHTML = "";
    var olliInfo = document.createElement("p"); // Create the <p> element
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
    const condensedString = tree.getCondensedString();
    console.log(condensedString);

    async function populateSuggestionButton() {
      return fetch("/api/get-backend-file?file_path=gptPrompts/initialSuggestionPrompt.txt", { redirect: 'manual' })
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

    const suggestionButtons = document.getElementsByClassName('suggestion-button');
    populateSuggestionButton()
      .then(function (suggestionQuestionsRawOutput) {
        console.log(suggestionQuestionsRawOutput);
        const questions = suggestionQuestionsRawOutput.split(/Question [1-3]: /).slice(1);
        for (var i = 0; i < (suggestionButtons.length - 1); ++i) {
          suggestionButtons[i].innerText = questions[i];
        }
        suggestionButtons[3].innerText = "What is my current position within the Olli Treeview?";
        document.getElementById("suggestion-container").style.display = "grid";
        document.getElementById("ask-question").style.display = "block";
        document.getElementById("QnA-header").style.display = "block";
      });

    setUpEventListener(olliContainer, activeElementStack);
  });

};

// Initialize Event Listener for Loading in VegaLite Spec
document.addEventListener('vegaLiteSpecChange', handleVegaLiteSpecChange);


// STEP 2 -> OpenAPI Question and Answer Integration


// Attach the Submit Event Listener Outside of handleVegaLiteSpecChange
// Handles User QnA
const suggestionButtons = document.getElementsByClassName('suggestion-button');
const subsequentSuggestionButtons = document.getElementsByClassName("subsequentSuggestionButton");
const completeSuggestionButtons = [...suggestionButtons, ...subsequentSuggestionButtons];

// Iterate through each element with the specified class
Array.from(completeSuggestionButtons).forEach(function (button) {
  button.addEventListener('click', function (event) {

    event.preventDefault();
    document.getElementById("user-query").value = button.innerText;
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

    const question = event.srcElement;
    // Triggers when User Submits Question; Provides Response through OpenAPI
    handleSubmit(event, question.firstChild.data, condensedString, loadingAnnouncement)
    question.removeAttribute("aria-live");
  })
})

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

  const question = document.getElementById("user-query");

  // Triggers when User Submits Question; Provides Response through OpenAPI
  handleSubmit(event, question.value, condensedString, loadingAnnouncement);
  question.removeAttribute("aria-live");
});

function handleSubmit(event, question, hierarchy, loadingAnnouncement) {
  event.preventDefault();
  document.getElementById("suggestion-container").style.display = "none";

  // Initialize Variables
  const descrPre = "\nHere's a structural layout of a data set. It is a hierarchy/tree data structure, where each sentence is preceded by its placement within the tree. For instance, 1.1.2 refers to the second child of the first child of the head:\n";
  // let descrPost = "\nBefore you output the answer check for the following:\nMake sure to format all numerical responses appropriately, using things such as commas, dollar signs, appropriate rounding, and other identifiers when necessary.\nYour answers should be verbose and must repeat the question.\nIf the question refers to data or variables that are not implied in the dataset and that you cannot reasonably extrapolate or calculate, respond with \"The variables you mentioned: {Specify which information triggered this response} are not provided in the dataset. Therefore, the question cannot be answered.\" and nothing more.\nUse this information along with everything else you are given to answer the following question: \n";
  // let descrPost = "\nBefore you output the answer check for the following:\nYou must follow the structure of Observation, Thought, Action, Action Input, etc.\nMake sure to format all numerical responses appropriately, using things such as commas, dollar signs, appropriate rounding, and other identifiers when necessary.\nYour answers should be specific, explanatory, and verbose, and must repeat the question.\n These answers will be read by a broad audience; you must avoid technical terms like 'dataframe' in your responses.\nUse everything you are given to answer the following question: \n";
  const descrPostFilePath = "gptPrompts/descrPost.txt";
  // const descrPostRaw = await fetch("/api/get-backend-file?file_path=" + descrPostFilePath);
  // const descrPostJSON = await descrPostRaw.json();
  // const descrPost = descrPostJSON["contents"];
  let supplement = descrPre + hierarchy + "Active Element: " + (activeElementNodeAddress + " // " + activeElementNodeInnerText + "\n");

  console.log("sending the question to the server", supplement + question);

  // Classify User Question
  // Classification Categories Include: Analytical Query; Visual Query; Contextual Query; Navigation Query
  classifyQuery(question).then(function (queryType) {
    // Apply Answering Pipeline Based on Classification Response
    document.getElementById("user-query").value = "";
    let classificationExplanation = "";
    // descrPost = "\nBefore you output the answer check for the following:\nYou must follow the structure of Observation, Thought, Action, Action Input, etc.\nIf your answer contains any technical words like \"dataframe\", \"python\", \"pd\", \"python_repl_ast\", or anything else related to programming, then go back and reevaluate your answer.\nOtherwise, make sure to format all numerical responses appropriately, using things such as commas, dollar signs, appropriate rounding, and other identifiers when necessary.\nYour answers should be specific, explanatory, and verbose, and must repeat the question.\nUse everything you are given to answer the following question: \n";
    // descrPost = "\nBefore you output any answer:\nYou must follow the set structure of Question, Observation, Thought, Action, Action Input when using the pd dataframe.\nTo avoid errors, your Action Input should always be formatted accordingly. Do not format your action input like this: Action Input: \n```python\n{Insert Code Here}\n```\nInstead format it like this: \"Action Input: {Insert Code Here on One Line}\"\nKeep in mind that it is possible for the user question to be incomplete, or not relate to the dataframe at all in which you cannot answer the question.\nMake sure the FINAL Answer is verbose and explanatory, and that it rephrases the user question. The answer should explain the process.\nIf the FINAL Answer contains a number or any value, make sure to format it appropriately, either through rounding, adding percents, or including labels.\nDo not use the words \"dataframe\" or \"python_repl_ast\" in your FINAL response\n";

    const improveUserQueryPromptFilePath = "gptPrompts/improveUserQueryPrompt.txt";
    fetch(("/api/get-backend-file?file_path=" + improveUserQueryPromptFilePath), { redirect: 'manual' })
      .then(function (improveUserQueryPromptRaw) {
        return improveUserQueryPromptRaw.json();
      })
      .then(async function (improveUserQueryPromptJSON) {
        console.log(improveUserQueryPromptJSON);
        let improveUserQueryPrompt = improveUserQueryPromptJSON["contents"];

        improveUserQueryPrompt = improveUserQueryPrompt
          .replace("{Description}", supplement)
          .replace("{Question}", question);

        sendPromptDefault(improveUserQueryPrompt, "gpt-4")
          .then(function (questionRevised) {
            if (questionRevised.startsWith("Question:")) {
              questionRevised = questionRevised.slice("Question:".length).trim();
            }
            console.log("REVISED QUESTION", questionRevised);
            if (queryType.includes("Analytical Query") || queryType.includes("Visual Query")) {
              fetch("/api/get-backend-file?file_path=" + descrPostFilePath)
                .then((descrPostRaw) => descrPostRaw.json())
                .then((descrPostJSON) => {
                  const descrPost = descrPostJSON["contents"];
                  classificationExplanation = "Your question \"" + question + "\" was categorized as being data-driven, and as such, has been answered based on the data in the chart.";
                  sendPromptAgent(supplement + descrPost, questionRevised, loadingAnnouncement, classificationExplanation, isTest);
                  // Use descrPost variable or perform actions with its value here
                })
                .catch((error) => {
                  // Handle any errors that occur during the fetch or processing
                  console.error('Error:', error);
                });
            }
            else if (queryType.includes("Contextual Query")) {
              sendPromptDefault("Here is a description of a dataset:" + hierarchy + "Use this description of the dataset along with outside knowledge to answer the following question:\nQuestion: " + questionRevised, "gpt-3.5-turbo-1106").then(function (response) {
                classificationExplanation = "Your question \"" + question + "\" was categorized as being context-seeking, and as such, has been answered based on information found on the web.";
        
                const loadStatus = document.getElementById("load-status");
                const responseInfo = document.getElementById("response-info");
        
                // Clear the loading announcement
                clearInterval(loadingAnnouncement);
        
                loadStatus.innerHTML = "Response Generated";
                responseInfo.style.display = "block";
        
                document.getElementById("prompt").textContent = "Question: " + classificationExplanation;
                (response != "Agent stopped due to iteration limit or time limit.") ? document.getElementById("response").textContent = "Answer: " + response : document.getElementById("response").textContent = "Answer: I'm sorry; the process has been terminated because it took too long to arrive at an answer.";
        
                if (response.startsWith("The variables you mentioned") || response.includes("I am sorry but I cannot understand the question") || response.includes("Agent stopped due to iteration limit or time limit")) {
                  document.getElementById("subsequentSuggestionsContainer").style.display = "flex";
                  generateSubsequentSuggestions(supplement, questionRevised, response)
                    .then(function (output) {
                      console.log(output);
                      const subsequentSuggestionButtons = document.getElementsByClassName("subsequentSuggestionButton");
                      const questions = output.split(/Question [1-3]: /).slice(1);
                      for (var i = 0; i < subsequentSuggestionButtons.length; ++i) {
                        subsequentSuggestionButtons[i].innerText = questions[i];
                      }
                    });
                }
              });
            }
            else if (queryType.includes("Navigation Query")) {
              // Provide Context to OpenAPI about User's Current Position within the Olli Treeview
        
              // Packaged Question to be Sent to OpenAPI
              const navigationQuestion = supplement + "\nUse all of this to answer the following question:\n" + questionRevised;
              const classificationExplanation = "Your question \"" + question + "\" was categorized as being related to navigating the chart structure, and as such has been answered based on the treeview.";
              const loadStatus = document.getElementById("load-status");
              const responseInfo = document.getElementById("response-info");
        
              // Answer Navigation Query
              handleNavigationQuery(navigationQuestion).then(function (response) {
                // Regular expression to match the starting and ending addresses
                const startingAddressPattern = /Starting Address: ([\d.]+)/;
                const endingAddressPattern = /Ending Address: ([\d.]+)/;
        
                // Extract starting and ending addresses using regular expressions
                console.log("Response: ", response);
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
                  // To Be Implemented
                  // navigationResponse = processInstructions(tree.getShortestPath(startNode, endNode)).final_string;
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
              });
            }
            // Query Cannot be Classified by LLM
            else {
              fetch("/api/get-backend-file?file_path=" + descrPostFilePath)
                .then((descrPostRaw) => descrPostRaw.json())
                .then((descrPostJSON) => {
                  const descrPost = descrPostJSON["contents"];
                  classificationExplanation = "Your question \"" + question + "\" was categorized as being data-driven, and as such, has been answered based on the data in the chart.";
                  sendPromptAgent(supplement + descrPost, questionRevised, loadingAnnouncement, classificationExplanation, isTest);
                  // Use descrPost variable or perform actions with its value here
                })
                .catch((error) => {
                  // Handle any errors that occur during the fetch or processing
                  console.error('Error:', error);
                });
              // classificationExplanation = "Your question \"" + question + "\" could not be properly categorized.";
              // sendPromptAgent(supplement + descrPost, question, loadingAnnouncement, classificationExplanation, isTest);
              // const loadStatus = document.getElementById("load-status");
              // const responseInfo = document.getElementById("response-info");
        
              // // Clear the loading announcement
              // clearInterval(loadingAnnouncement);
        
              // loadStatus.innerHTML = "Response Generated";
              // responseInfo.style.display = "block";
        
              // document.getElementById("prompt").textContent = classificationExplanation;
              // document.getElementById("response").textContent = queryType;
        
              document.getElementById("subsequentSuggestionsContainer").style.display = "flex";
              generateSubsequentSuggestions(supplement, questionRevised, classificationExplanation)
                .then(function (output) {
                  console.log(output);
                  const subsequentSuggestionButtons = document.getElementsByClassName("subsequentSuggestionButton");
                  const questions = output.split(/Question [1-3]: /).slice(1);
                  for (var i = 0; i < subsequentSuggestionButtons.length; ++i) {
                    subsequentSuggestionButtons[i].innerText = questions[i];
                  }
                });
              // question.removeAttribute("aria-live");
              // question.value = '';
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      });
  })
    .catch(function (error) {
      console.error(error); // Handle any errors that occurred during the promise
    });
}
