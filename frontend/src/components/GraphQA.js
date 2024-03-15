import React, {useEffect, useState, useRef} from "react";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import "../styles/GraphQAStyle.css"
import Olli from "./Olli";
import { getAnswer, getValuesForKey, findContinentByCountry, getColorName, getSuggestedQuestions, generateSubsequentSuggestions} from "../utils/helperFuncs";

import { VegaLite } from 'react-vega'
import GraphTable from "./GraphTable";
import QAModule from "./QAModule";
import { Stack } from "../utils/stack";
import { CondensedOlliRender } from "../utils/condenseOlliRender";



const GraphQA = ({graphSpec, setGraphSpec}) => {

    const [showOlli, setShowOlli] = useState(false)
    const [showTable, setShowTable] = useState(false)
    const [transformedData, setTransformedData] = useState([])

    // Initialize All Global Variables as ref
    const activeElement = useRef('');
    const activeElementNode = useRef(null);
    const activeElementNodeAddress = useRef(null);
    const activeElementNodeInnerText = useRef(null);
    const tree = useRef(null);

    // QA module states
    const [suggestedQuestions, setSuggestedQuestions] = useState([])
    const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)
    const [classificationExplanation, setClassificationExplanation] = useState('')
    const [answerToQuestion, setAnswerToQuestion] = useState('')
    const [revisedQuestion, setRevisedQuestion] = useState('')
    const [userQuestion, setUserQuestion] = useState('') 

    function resetQAStates() {
      // prepare for new question or new specs
      // setSuggestedQuestions([])
      setRevisedQuestion('')
      setClassificationExplanation('')
      setAnswerToQuestion('')
    }

    function polishData (data, view) {
    /**
     * Return a list of objects with polished data.
     * @param data data from the vega view
     * @param view vega view
     */
    return data.map((item) => {
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
      if (graphSpec.encoding.color && graphSpec.encoding.color.field) {
        const colorScale = view.scale('color');
        const independentVariable = item[graphSpec.encoding.color.field];
        if (independentVariable !== "None") {
          const colorInfo = colorScale(independentVariable);
          newItem["Color"] = getColorName(colorInfo);
        }
      }
      return newItem;
    });
    }

    function handleViewUpdates (view) {
      /**
       * Transforms the unpolished data from view to send to the backend
       * and updates all neccessary states.
       * @param view Vega view.
       */
      const data = view.data("source_0");
      const transformedDataPolished = polishData(data, view);
      setTransformedData(transformedDataPolished)
      
      // Send Transformed Data JSON to Backend
      const payload = {
        content: transformedDataPolished
      }

      fetch(process.env.REACT_APP_BACKEND_URL + "/api/process-json", {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
      }).then((response) => {
          if (response.ok) {
              console.log("JSON file sent successfully.")
          } else {
              console.log("JSON file sent unsuccessfully.")
          }
      }).catch((error) => {
          console.error('Error:', error);
      })
    };

    // https://vega.github.io/vega/docs/api/view/#data-and-scales
    const handleNewView = view => {
    /**
     * Get the transformed data every time there is a view update (spec changes),
     * transform it then send it to the backend.
     * @param view Vega view
     */

      resetQAStates();
      handleViewUpdates(view);
      // Updates Transformed Data, add event listener
      const sliderInput = document.querySelector('input[type="range"]');
      if (sliderInput) {
        const parameterName = sliderInput.getAttribute("name");
        sliderInput.addEventListener("input", () => {
          const valueChanged = parseInt(sliderInput.value, 10);
          view.signal(parameterName, valueChanged).runAsync();
          // find which param got updated to update the spec to rerender the olli
          const newSpec = {...graphSpec};
          for (let i = 0; i < newSpec.params.length; i++) { 
            if (newSpec.params[i].name === parameterName) {
              newSpec.params[i].value = valueChanged;
            }
          }
          setGraphSpec(newSpec);
          handleViewUpdates(view);
        });
      }

      const olliContainer = document.getElementById("olli-container");

      // Stack used to Track Active Elements within Treeview
      const activeElementStack = new Stack();

      function setUpEventListener(olliContainer, activeElementStack) {
        function nestedEventListener(event) {
          event.stopImmediatePropagation(); // necessary to prevent the creation of subsequent nested event listeners
    
          activeElement.current = event.srcElement.firstChild.innerText;
          // Retrieve Active Element Node Object from activeElement Variable
          const index = tree.current.getTreeItemArray().findIndex(obj => obj.getInnerText() === activeElement);
          // nothing was found, eg. user select something from the pop up table
          if (index === -1) {
            return;
          }

          activeElementNode.current = tree.current.getTreeItemArray()[index];
          activeElementNodeAddress.current = activeElementNode.current.getAddress();
          activeElementNodeInnerText.current = activeElementNode.current.getInnerText();
    
          // Check for Up Arrow KeyUp
          if (event.keyCode === 38) {
            const previousElement = activeElementStack.peek(); // returns only the text of previous element
            let correspondingElement = null;
    
            // Get Previous Element Node Object
            tree.current.getTreeItemArray().forEach(element => {
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
            tree.current.getTreeItemArray().forEach(element => {
              if (element.getAddress().slice(0, -1) == activeElementNode.current.getAddress().slice(0, -1)) {
                element.setIsActiveChild(false);
              }
            })
            activeElementNode.current.setIsActiveChild(true);
          }
    
          activeElementStack.push(activeElementNode.current);
        }
    
        olliContainer.addEventListener('keyup', nestedEventListener);
      }
      // Hierarchical Tree Representation of Olli Treeview
      tree.current = new CondensedOlliRender(document.querySelector('.olli-vis'));
      const condensedString = tree.current.getCondensedString();

      // generate questions
      handleGetNewSuggestedQuestions(condensedString);

      setUpEventListener(olliContainer, activeElementStack);
    };

    function handleGetNewSuggestedQuestions(condensedString) {
      /**
       * Populate new suggested questions/
       * @param condensedString textual information about the olli tree
       */
      getSuggestedQuestions(condensedString)
      .then(function (suggestionQuestionsRawOutput) {
        // console.log(suggestionQuestionsRawOutput);
        const questions = suggestionQuestionsRawOutput.split(/Question [1-3]: /).slice(1);
        questions.push("What is my current position within the Olli Treeview?")
        setSuggestedQuestions(questions)
      }).catch((error)=>{
        console.log("Error in getting suggestion:", error)
      });
    }

    // function handleVegaError(error) {
    //   // setGraphSpec({})
    //   console.log("ehre", error)
    // }

    

    async function updateSubsequentQuestions (supplement, question, response, always = false) {
      /**
       * Updates suggested questions if conditions are met.
       * @param supplement Structural layout of the dataset in text.
       * @param question a string holding the user question
       * @param response a string holding the response to the question
       * @param always If true, then will generate new questions no matter what. 
       */
      if (always || response.startsWith("The variables you mentioned") || response.includes("I am sorry but I cannot understand the question") || response.includes("Agent stopped due to iteration limit or time limit")) {

        const output = await generateSubsequentSuggestions(supplement, question, response);
        const newSuggestedQuestions = output.split(/Question [1-3]: /).slice(1);
        setSuggestedQuestions(newSuggestedQuestions);

      }
    }

    async function handleQuestionSubmit (question) {
      /**
       * Get the answer based on the question and updates all neccessary states.
       * @param question a string holding the user question
       */

      if (isLoadingAnswer) { // already true, that means previous question has not fned loading
        alert("STILL WAITING for previous question!")
        return;
      }
      resetQAStates();
      setIsLoadingAnswer(true);
      setUserQuestion(question);
      const answerObj =  await getAnswer(question, tree.current.getCondensedString(), activeElementNodeAddress.current, activeElementNodeInnerText.current, tree.current);
      const queryType = answerObj.queryType;
      const questionRevised = answerObj.questionRevised;
      const answer = answerObj.answer;
      const supplement = answerObj.supplement;
      setRevisedQuestion(questionRevised);

      if (queryType.includes("Analytical Query") || queryType.includes("Visual Query")) {
        const classificationExpl = "Your question \"" + question + "\" was categorized as being data-driven, and as such, has been answered based on the data in the chart.";
        setClassificationExplanation(classificationExpl);

        // check if need to generate subsequentsuggestionquestions
        await updateSubsequentQuestions(supplement, question, answer);

        if (answer !== "Agent stopped due to iteration limit or time limit.") {
          setAnswerToQuestion(answer);
        } else {
          setAnswerToQuestion("I'm sorry; the process has been terminated because it either took too long to arrive at an answer or your question was too long.");
        }

      } else if (queryType.includes("Contextual Query")) {
        const classificationExpl = "Your question \"" + question + "\" was categorized as being context-seeking, and as such, has been answered based on information found on the web.";
        setClassificationExplanation(classificationExpl);

        // check if need to generate subsequentsuggestionquestions, context uses the revisedQuestion
        await updateSubsequentQuestions(supplement, questionRevised, answer);

        if (answer !== "Agent stopped due to iteration limit or time limit.") {
          setAnswerToQuestion(answer);
        } else {
          setAnswerToQuestion("I'm sorry; the process has been terminated because it either took too long to arrive at an answer or your question was too long.");
        }

      }  else if (queryType.includes("Navigation Query")) {
        const classificationExpl = "Your question \"" + question + "\" was categorized as being related to navigating the chart structure, and as such has been answered based on the treeview.";
        setClassificationExplanation(classificationExpl);
        setAnswerToQuestion(answer);

      } else { // cannot be classibled
        // const classificationExpl = "Your question \"" + question + "\" was categorized as being data-driven, and as such, has been answered based on the data in the chart.";
        const classificationExpl = "Your question \"" + question + "\" was uncategorizable.";
        setClassificationExplanation(classificationExpl)
        
        // check if need to generate subsequentsuggestionquestions, context uses the revisedQuestion
        await updateSubsequentQuestions(supplement, questionRevised, answer, true);
        if (answer !== "Agent stopped due to iteration limit or time limit.") {
          setAnswerToQuestion(answer);
        } else {
          setAnswerToQuestion("I'm sorry; the process has been terminated because it either took too long to arrive at an answer or your question was too long.");
        }
      }
      setIsLoadingAnswer(false)
    }

    return (
        <div>
            <Container className="graph-container">{graphSpec && <VegaLite spec={graphSpec} onNewView={handleNewView}/>}</Container>

            {graphSpec && <Col className="add-big-margin" aria-live="polite">
                  <Button className="toggle-buttons" variant="outline-primary" onClick={() => {
                    setShowOlli(!showOlli);
                    if (!showOlli) { // olli should be true now
                      setShowTable(false)
                    }
                }}>Toggle Olli</Button>

                <Button className="toggle-buttons" variant="outline-success"  onClick={() => {
                    setShowTable(!showTable);
                    if (!showTable) { // table should be true now
                      setShowOlli(false)
                    }
                }}>Toggle Table</Button>

                </Col>}


            <Olli showOlli = {showOlli} graphSpec = {graphSpec}/>

            {showTable &&  <GraphTable transformedData={transformedData} />}

            <QAModule classificationExplanation = {classificationExplanation}
            answerToQuestion = {answerToQuestion}
            isLoadingAnswer = {isLoadingAnswer}
             handleQuestionSubmit = {handleQuestionSubmit}
              suggestedQuestions = {suggestedQuestions}
              revisedQuestion = {revisedQuestion}
              userQuestion={userQuestion}
              />
        </div>
    );
};

export default GraphQA;