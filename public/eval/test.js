import { CondensedOlliRender } from "../condenseOlliRender.js";
import { loadVGandSendToBackend } from "./../vgLoader.js";
import { handleDataUpdate, sendPromptDefault, sendPromptAgent, getActiveAddress, handleNavigationQuery } from "../helperFunctions.js";

// Initialize Global Variables
const isTest = true;
const descrPre = "\nHere's a description of a data set. It is a hierarchy/tree data structure, where each sentence is preceded by its placement within the tree. For instance, 1.1.2 refers to the second child of the first child of the head:\n";
const descrPost = "\nBefore you output the answer check for the following:\nMake sure to format all numerical responses appropriately, using things such as commas, dollar signs, appropriate rounding, and other identifiers when necessary.\nYour answers should be verbose and must repeat the question.\nYour answers must include all UNIX timestamps as calendar dates.\nIf the question refers to data or variables that are not explicitly mentioned in the dataset, respond with \"The variables you mentioned are not provided in the dataset.\" and nothing more.\nUse this information along with everything else you are given to answer the following question: \n";
  
// MAIN FUNCTION; Runs Evaluation
async function clickHandler(isEvaluate) {
    // const folderPath = "./test/validationAndTraining";
    // const hasFilesRaw = await fetch('/api/check_folder?folder_path=' + folderPath);
    // const hasFilesData = await hasFilesRaw.json();
    // const hasFiles = hasFilesData.has_files;
    // if (!hasFiles) {
    //     await generateValidationAndTestingSets();
    // }

    // Fetch Testing Set Sample from Backend
    const testingSetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqI7MVGIhfO2pC15SoFvx9GDVCjS9s2XT33udfK9ck0YHW_ztZ0b0hCaTfcOoisRo8sakelJ4w2Lho/pub?gid=1871207598&single=true&output=csv";
    // const testingSetSample = await getQuestions("test/validationAndTraining/testingSetSample.csv");
    const testingSet = await getQuestions(testingSetURL);

    const testingSetSample = {};

    for (const key in testingSet) {
        if (testingSet.hasOwnProperty(key)) {
            testingSetSample[key] = testingSet[key].slice(225, 250);
        }
    }


    console.log(testingSetSample);
    // console.log(testingSet);
    // const testingSetSample = {
    //     "chart1": [testingSet["chart1"][0], testingSet["chart1"][1], testingSet["chart1"][2]],
    //     "chart2": [testingSet["chart2"][0], testingSet["chart2"][1], testingSet["chart2"][2]],
    //     "chart3": [testingSet["chart3"][0], testingSet["chart3"][1], testingSet["chart3"][2]],
    //     "chart4": [testingSet["chart4"][0], testingSet["chart4"][1], testingSet["chart4"][2]]
    // }
    // console.log(testingSetSample);


    // Run Evaluation for Testing Set Sample
    // The Corresponding VegaLite Spec and Olli Treeview are Rendered for each Query
    // Each Query is then Answered Using the Pipeline
    for (var [key, value] of Object.entries(testingSetSample)) {
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
            if (isEvaluate) {
                await answerQuestions(value, supplement);
            }

        } catch (error) {
            console.error(error);
        }
    }

    // Assess LLM response
    // for (var [key, value] of Object.entries(testingSetSample)) {
    //     for (const obj of value) {
    //         console.log(obj.answer);

    //     }
    // }

    // Convert the Updated Questions Dictionary Back to CSV String
    const csvData = Papa.unparse(Object.entries(testingSetSample).flatMap(([key, value]) => {
        return value.map(questionObj => ({
            Stimuli: key,
            Questions: questionObj.question,
            Ground_Truth: questionObj.ground_truth,
            Classification: questionObj.classification,
            Classification_Assessment: questionObj.classification_assessment,
            Verbose_Ground_Truth: questionObj.verbose_ground_truth,
            Answer: questionObj.answer, // Include the answer in the CSV output
            Assessment: questionObj.assessment,
            Binary_Assessment: questionObj.binary_assessment
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
async function getQuestions(testingSetURL) {
    return fetch(testingSetURL)
        .then(response => response.text())
        .then(csvData => {
            console.log(csvData); // The fetched CSV data as a string
            return convertStringToDictionary(csvData);
        })
        .catch(error => {
            console.error('Error fetching CSV:', error);
        });



    // return fetch("/api/get-backend-file?file_path=" + filePath)
    //     .then(function (response) {
    //         return response.json();
    //     })
    //     .then(function (data) {
    //         const contents = data.contents;
    //         return convertStringToDictionary(contents);
    //     })
}

function convertStringToDictionary(csvString) {
    const questionsDictionary = {};
    Papa.parse(csvString, {
        header: true,
        delimiter: ',',
        complete: function (results) {
            results.data.forEach((row) => {
                const { Stimuli, Questions, Ground_Truth, Verbose_Ground_Truth } = row;
                if (!questionsDictionary[Stimuli]) {
                    questionsDictionary[Stimuli] = [];
                }
                questionsDictionary[Stimuli].push({
                    question: Questions,
                    ground_truth: Ground_Truth,
                    classification: '', // Add an empty classification property for each question
                    classification_assessment: '',
                    verbose_ground_truth: Verbose_Ground_Truth,
                    answer: '', // Add an empty answer property for each question
                    assessment: '',
                    binary_assessment: ''
                });
            });
        },
    });
    return questionsDictionary;
}

// Classify Questions 
// Update Data Dictionary with OpenAPI Predicted Classifications
async function classifyQuestions(value) {
    // const filePath = "gptPrompts/queryClassification.txt";
    // const classificationResponse = await fetch("/api/get-backend-file?file_path=" + filePath, { redirect: 'manual' });
    // console.log(value.question);
    // const classificationResponse = await fetch("/api/get-validation-few-shot-prompting?user_query=" + value.question, { redirect: 'manual' });
    // const classificationQuery = await classificationResponse.json();
    // const classificationQueryContents = classificationQuery["contents"];

    for (const classificationObj of value) {
        const question = classificationObj.question;
        const groundTruth = classificationObj.ground_truth;
        let classificationAssessment = "Incorrect Classification";

        const classificationTemplate = await fetch("/api/get-validation-few-shot-prompting?user_query=" + question, { redirect: 'manual' });
        const classificationQuery = await classificationTemplate.json();
        const classificationQueryContents = classificationQuery["contents"];
        const classificationResponse = await sendPromptDefault(classificationQueryContents + question);
        if (classificationResponse.includes("Analytical Query")) { classificationObj.classification = "Analytical Query" }
        else if (classificationResponse.includes("Visual Query")) { classificationObj.classification = "Visual Query" }
        else if (classificationResponse.includes("Contextual Query")) { classificationObj.classification = "Contextual Query" }
        else { classificationObj.classification = "I am sorry but I cannot understand the question" }
        document.getElementById("prompt").innerText = "Question: " + question;
        document.getElementById("response").innerText = "Response: " + classificationObj.classification;

        if (classificationObj.classification == groundTruth) {
            classificationAssessment = "Correct Classification";
        }
        classificationObj.classification_assessment = classificationAssessment;
    }
}

// Answer Queries Based on Previously Determined Classifications
async function answerQuestions(value, supplement) {
    for (const questionObj of value) {

        const question = questionObj.question;
        const classification = questionObj.classification;
        const groundTruth = questionObj.verbose_ground_truth;

        if (classification.includes("Analytical Query") || classification.includes("Visual Query")) {
            const response = await sendPromptAgent(supplement, question, null, null, isTest);
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
                questionObj.answer = response;
            });
        }
        else {
            const response = "I am sorry but I cannot understand the question";
            document.getElementById("prompt").textContent = question;
            document.getElementById("response").textContent = response;
            questionObj.answer = response;
        }

        const assessmentQuestionFilePath = "gptPrompts/likertScaleEvaluationQuery.txt";
        const assessmentQuestionTemplateRaw = await fetch("/api/get-backend-file?file_path=" + assessmentQuestionFilePath);
        const assessmentQuestionTemplateJSON = await assessmentQuestionTemplateRaw.json();
        let assessmentQuestionTemplate = assessmentQuestionTemplateJSON["contents"];

        assessmentQuestionTemplate = assessmentQuestionTemplate
            .replace("{Question}", question)
            .replace("{Response A}", groundTruth)
            .replace("{Response B}", questionObj.answer);

        const assessmentRaw = await sendPromptDefault(assessmentQuestionTemplate);
        let assessment = "";

        switch (true) {
            case assessmentRaw.includes("1"):
                assessment = "Very Poor";
                break;
            case assessmentRaw.includes("2"):
                assessment = "Poor";
                break;
            case assessmentRaw.includes("3"):
                assessment = "Fair";
                break;
            case assessmentRaw.includes("4"):
                assessment = "Good";
                break;
            case assessmentRaw.includes("5"):
                assessment = "Very Good";
                break;
            default:
                assessment = "Could Not Be Assessed";
                console.log(assessmentRaw);
        }

        questionObj.assessment = assessment;

        const binaryAssessmentQuestionFilePath = "gptPrompts/binaryEvaluationQuery.txt";
        const binaryAssessmentQuestionTemplateRaw = await fetch("/api/get-backend-file?file_path=" + binaryAssessmentQuestionFilePath);
        const binaryAssessmentQuestionTemplateJSON = await binaryAssessmentQuestionTemplateRaw.json();
        let binaryAssessmentQuestionTemplate = binaryAssessmentQuestionTemplateJSON["contents"];

        binaryAssessmentQuestionTemplate = binaryAssessmentQuestionTemplate
            .replace("{Question}", question)
            .replace("{Response A}", groundTruth)
            .replace("{Response B}", questionObj.answer);

        const binaryAssessmentRaw = await sendPromptDefault(binaryAssessmentQuestionTemplate);
        let binaryAssessment = "";
        switch (true) {
            case binaryAssessmentRaw.includes("Incorrect"):
                console.log(binaryAssessmentRaw);
                binaryAssessment = "Incorrect Answer";
                break;
            case binaryAssessmentRaw.includes("Correct"):
                binaryAssessment = "Correct Answer";
                break;
        }

        questionObj.binary_assessment = binaryAssessment;
    }
};


async function generateValidationAndTestingSets() {
    const questionsDictionary = await getQuestions("./test/testQuestions.csv");
    // After Classifying all Questions, Split into Testing and Validation Sets Based on Strata

    function getRandomSubset(array, percent) {
        const subsetSize = Math.ceil(array.length * percent);
        const shuffled = array.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, subsetSize);
    }

    async function sendEvalSetToBackend(set, type) {
        // Convert the Updated Questions Dictionary Back to CSV String
        const csvData = Papa.unparse(Object.entries(set).flatMap(([key, value]) => {
            return value.map(questionObj => ({
                Stimuli: key,
                Questions: questionObj.question,
                Ground_Truth: questionObj.ground_truth,
                Evaluation: type
            }));
        }), { header: true });

        const dataToSend = {
            csvData: csvData,
            type: type,
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        };

        try {
            const response = await fetch("/api/process-eval-sets", requestOptions);
            if (response.ok) {
                console.log('Data sent successfully to the backend!');
            } else {
                console.error('Failed to send data to the backend.');
            }
        } catch (error) {
            console.error('Error while sending data:', error);
        }
    }

    // Initialize the validationSet and testingSet Dictionaries
    const validationSet = {};
    const testingSet = {};
    const validationSetSample = {};
    const testingSetSample = {};

    // Iterate over the Input Dictionary
    for (const [key, value] of Object.entries(questionsDictionary)) {
        // Initialize the Classification Groups
        const groups = {
            "Analytical Query": [],
            "Visual Query": [],
            "Contextual Query": [],
            "Navigation Query": [],
            "I am sorry but I cannot understand the question": []
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

            validationSet[key] = validationSet[key] || [];
            validationSet[key].push(...validationQuestions);

            testingSet[key] = testingSet[key] || [];
            testingSet[key].push(...testingQuestions);

            const validationSample = getRandomSubset(validationQuestions, 0.2);
            const testingSample = getRandomSubset(testingQuestions, 0.05);

            validationSetSample[key] = validationSetSample[key] || [];
            validationSetSample[key].push(...validationSample);

            testingSetSample[key] = testingSetSample[key] || [];
            testingSetSample[key].push(...testingSample);
        }
    }
    await sendEvalSetToBackend(validationSet, "validationSet");
    await sendEvalSetToBackend(validationSetSample, "validationSetSample");

    await sendEvalSetToBackend(testingSet, "testingSet");
    await sendEvalSetToBackend(testingSetSample, "testingSetSample");
}
