import { CondensedOlliRender } from "../condenseOlliRender.js";
import { loadVGandSendToBackend } from "./../vgLoader.js";
import { handleDataUpdate, sendPromptDefault, sendPromptAgent, getActiveAddress, handleNavigationQuery } from "../helperFunctions.js";

// Initialize Global Variables
const descrPre = "Here's a description of a data set. It is a hierarchy/tree data structure, where each sentence is preceded by its placement within the tree. For instance, 0.0.1 refers to the second child of the first child of the head:\n";
const descrPost = "Use this information along with everything else you are given to answer the following question: \n";

// MAIN FUNCTION; Runs Evaluation
async function clickHandler(isEvaluate) {
    const questionsDictionary = await getQuestions();
    console.log(questionsDictionary);

    // After Classifying all Questions, Split into Testing and Validation Sets Based on Strata

    function getRandomSubset(array, percent) {
        const subsetSize = Math.ceil(array.length * percent);
        const shuffled = array.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, subsetSize);
    }

    // Initialize the validation_set and testing_set Dictionaries
    const validation_set = {};
    const testing_set = {};
    const validation_set_sample = {};
    const testing_set_sample = {};

    // Iterate over the Input Dictionary
    for (const [key, value] of Object.entries(questionsDictionary)) {
        // Initialize the Classification Groups
        const groups = {
            "Analytical Query": [],
            "Visual Query": [],
            "Contextual Query": [],
            "Navigation Query": [],
            "The question cannot be classified": []
        };

        // Group the Questions Based on Classification
        for (const question of value) {
            const { ground_truth } = question;
            try {
                groups[ground_truth].push(question);
            } catch (error) {
                console.error(error);
            }
        }

        // Stratified Random Sampling for each Classification Group
        for (const [ground_truth, questions] of Object.entries(groups)) {
            const validationQuestions = getRandomSubset(questions, 0.2);
            const testingQuestions = questions.filter(
                question => !validationQuestions.includes(question)
            );

            validation_set[key] = validation_set[key] || [];
            validation_set[key].push(...validationQuestions);

            testing_set[key] = testing_set[key] || [];
            testing_set[key].push(...testingQuestions);

            const validationSample = getRandomSubset(validationQuestions, 0.2);
            const testingSample = getRandomSubset(testingQuestions, 0.1);

            validation_set_sample[key] = validation_set_sample[key] || [];
            validation_set_sample[key].push(...validationSample);

            testing_set_sample[key] = testing_set_sample[key] || [];
            testing_set_sample[key].push(...testingSample);
        }
    }

    // Run Evaluation for Testing Set Sample
    // The Corresponding VegaLite Spec and Olli Treeview are Rendered for each Query
    // Each Query is then Answered Using the Pipeline
    for (var [key, value] of Object.entries(testing_set_sample)) {
        try {
            // Render VegaLite Spec Corresponding to the Query being Asked
            const response = await fetch("/api/get-backend-file?file_path=./test/testVegaLiteSpecs/" + key + ".vg");
            const data = await response.json();
            const vLSpec = JSON.parse(data.contents);

            const vLData = {
                "contents": vLSpec
            };

            // Load VegaLite Spec to the Backend
            loadVGandSendToBackend(vLData);

            const vegaSpec = await vegaLite.compile(vLSpec).spec;
            const runtime = await vega.parse(vegaSpec);

            const vegaContainer = document.getElementById("vega-container");
            const view = await new vega.View(runtime)
                .logLevel(vega.Warn)
                .initialize(vegaContainer)
                .renderer("svg")
                .hover()
                .runAsync();
            console.log(view);
            handleDataUpdate(view, vLSpec);

            // Render Olli Treeview
            // Matched to the Current Query
            const olliContainer = document.getElementById("olli-container");
            const olliVisSpec = await OlliAdapters.VegaLiteAdapter(vLSpec);
            const olliRender = olli(olliVisSpec);
            olliContainer.innerHTML = "";
            olliContainer.append(olliRender);
            const condensedOlliRender = new CondensedOlliRender(document.querySelector('.olli-vis'));
            const condensedString = condensedOlliRender.getCondensedString();

            const supplement = descrPre + condensedString + descrPost;

            // Classify Questions
            await classifyQuestions(value);

            // Trigger only when Run Evaluation DOM Element Button is Clicked
            if (isEvaluate) { await answerQuestions(value, supplement); }

        } catch (error) {
            console.error(error);
        }
    }

    // Convert the Updated Questions Dictionary Back to CSV String
    const csvData = Papa.unparse(Object.entries(testing_set_sample).flatMap(([key, value]) => {
        return value.map(questionObj => ({
            Stimuli: key,
            Questions: questionObj.question,
            Ground_Truth: questionObj.ground_truth,
            Classification: questionObj.classification,
            Answer: questionObj.answer // Include the answer in the CSV output
        }));
    }), { header: true });

    // Create a Blob Object from the CSV Data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });

    // Set the Download Link href and Trigger the Click Event
    const downloadLink = document.getElementById('download-link');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.setAttribute('download', 'updated_questions.csv');
    downloadLink.click();
}

document.getElementById("run-eval").addEventListener("click", function () {
    clickHandler(true);
});

document.getElementById("run-classification").addEventListener("click", function () {
    clickHandler(false);
});



// HELPER FUNCTIONS

// Retrive Question Pool from Backend
// Outputs Dictionary
async function getQuestions() {
    const filePath = "./test/testQuestions.csv"
    return fetch("/api/get-backend-file?file_path=" + filePath)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const contents = data.contents;
            return convertStringToDictionary(contents);
        })
}

function convertStringToDictionary(csvString) {
    const questionsDictionary = {};
    Papa.parse(csvString, {
        header: true,
        delimiter: ',',
        complete: function (results) {
            results.data.forEach((row) => {
                const { Stimuli, Questions, Ground_Truth } = row;
                if (!questionsDictionary[Stimuli]) {
                    questionsDictionary[Stimuli] = [];
                }
                questionsDictionary[Stimuli].push({
                    question: Questions,
                    ground_truth: Ground_Truth,
                    classification: '', // Add an empty classification property for each question
                    answer: '' // Add an empty answer property for each question
                });
            });
        },
    });
    return questionsDictionary;
}

// Classify Questions 
// Update Data Dictionary with OpenAPI Predicted Classifications
async function classifyQuestions(value) {
    const filePath = "gptPrompts/queryClassification.txt";
    const response = await fetch("/api/get-backend-file?file_path=" + filePath, { redirect: 'manual' });
    const classificationQuery = await response.json();
    const classificationQueryContents = classificationQuery["contents"];

    for (const classificationObj of value) {
        const question = classificationObj.question;
        const classificationResponse = await sendPromptDefault(classificationQueryContents + question);
        if (classificationResponse.includes("Analytical Query")) { classificationObj.classification = "Analytical Query" }
        else if (classificationResponse.includes("Visual Query")) { classificationObj.classification = "Visual Query" }
        else if (classificationResponse.includes("Contextual Query")) { classificationObj.classification = "Contextual Query" }
        else { classificationObj.classification = "The question cannot be classified." }
    }
}

// Answer Queries Based on Previously Determined Classifications
async function answerQuestions(value, supplement) {
    for (const questionObj of value) {
        const question = questionObj.question;
        const classification = questionObj.classification;
        if (classification.includes("Analytical Query") || classification.includes("Visual Query")) {
            const response = await sendPromptAgent(supplement, question);
            questionObj.answer = response;
        }
        else if (classification.includes("Contextual Query")) {
            const response = await sendPromptDefault(question);
            document.getElementById("prompt").textContent = question;
            document.getElementById("response").textContent = response;
            questionObj.answer = response;
        }
        else if (classification.includes("Navigation Query")) {
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
        else {
            const response = "The question could not be classified.";
            document.getElementById("prompt").textContent = question;
            document.getElementById("response").textContent = response;
            questionObj.answer = response;
        }
    }
};
