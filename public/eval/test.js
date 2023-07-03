import { CondensedOlliRender } from "./testCondenseOlliRender.js";
import loadFileAndSendToBackend from "./../fileLoader.js";
import { loadVGandSendToBackend } from "./../vgLoader.js";

const descrPre = "Here's a description of a data set. It is a hierarchy/tree data structure, where each sentence is preceded by its placement within the tree. For instance, 0.0.1 refers to the second child of the first child of the head:\n";
const descrPost = "Use this information along with everything else you are given to answer the following question: \n";

function convertStringToDictionary(csvString) {
    const questionsDictionary = {};
    Papa.parse(csvString, {
        header: true,
        delimiter: ',',
        complete: function (results) {
            results.data.forEach((row) => {
                const { Stimuli, Questions } = row;
                if (!questionsDictionary[Stimuli]) {
                    questionsDictionary[Stimuli] = [];
                }
                questionsDictionary[Stimuli].push({
                    question: Questions,
                    answer: '' // Add an empty answer property for each question
                });
            });
        },
    });
    return questionsDictionary;
}

async function getQuestions() {
    const filePath = "./test/testQuestions.csv"
    return fetch("/api/get-backend-file?file_path=" + filePath)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const contents = data.contents;
            const sanitizedContents = contents.substring(3, contents.length);
            return convertStringToDictionary(sanitizedContents);
        })
}

async function classifyQuery(question) {
    const filePath = "gptPrompts/queryClassification.txt"
    return fetch("/api/get-backend-file?file_path=" + filePath, { redirect: 'manual' })
        .then(function (response) {
            return response.json();
        })
        .then(async function (classificationQuery) {
            const classificationQueryContents = classificationQuery["contents"];

            return sendPromptDefault(classificationQueryContents + question)
                .then(function (output) {
                    return output; // Return the output value if needed for further processing
                })
                .catch(function (error) {
                    console.error(error);
                });
        });
}

async function sendPromptDefault(question) {
    console.log("prompt", question);
    return fetch("/api/prompt?question=" + question, { redirect: 'manual' })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log("response", data["response"]);
            return data["response"];
        });
}

async function sendPromptAgent(supplement, question) {
    console.log("prompt", question);
    return fetch("/api/apply-agent?question=" + supplement + question, { redirect: 'manual' })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("response", data);
            document.getElementById("prompt").textContent = question;
            document.getElementById("response").textContent = data.response;
            return data["response"];
        })
}

document.getElementById("run-eval").addEventListener("click", async function () {
    const questionsDictionary = await getQuestions();

    for (var [key, value] of Object.entries(questionsDictionary)) {
        if (key != "chart4") {
            try {
                const response = await fetch("/api/get-backend-file?file_path=" + "./test/testVegaLiteSpecs/" + key + ".vg");
                const data = await response.json();
                const vLSpec = JSON.parse(data.contents);

                let vLData;

                if (vLSpec.data && vLSpec.data.url) {
                    vLData = {
                        "contents": vLSpec,
                        "url": vLSpec.data.url
                    };
                }

                else if (vLSpec.data && vLSpec.data.values) {
                    vLData = {
                        "contents": vLSpec,
                        "values": vLSpec.data.values
                    };
                }

                loadFileAndSendToBackend(vLData);
                loadVGandSendToBackend(vLData);

                const vegaSpec = await vegaLite.compile(vLSpec).spec;
                const runtime = await vega.parse(vegaSpec);

                const vegaContainer = document.getElementById("vega-container");
                const view = new vega.View(runtime)
                    .logLevel(vega.Warn)
                    .initialize(vegaContainer)
                    .renderer("svg")
                    .hover();

                const olliContainer = document.getElementById("olli-container");
                const olliVisSpec = await OlliAdapters.VegaLiteAdapter(vLSpec);
                const olliRender = olli(olliVisSpec);
                olliContainer.innerHTML = "";
                olliContainer.append(olliRender);
                const condensedOlliRender = new CondensedOlliRender(document.querySelector('.olli-vis'));
                const condensedString = condensedOlliRender.getCondensedString();

                for (const questionObj of value) {
                    const question = questionObj.question;
                    const supplement = descrPre + condensedString + descrPost;

                    console.log("sending the question to the server", question);

                    try {
                        const queryType = await classifyQuery(question);
                        console.log(question + " : " + queryType);

                        if (queryType.includes("Analytical Query")) {
                            const response = await sendPromptAgent(supplement, question);
                            questionObj.answer = response;
                        } else if (queryType.includes("Contextual Query")) {
                            const response = await sendPromptDefault(question);
                            document.getElementById("prompt").textContent = question;
                            document.getElementById("response").textContent = response;
                            questionObj.answer = response;
                        } else if (queryType.includes("Visual Query")) {
                            // implement later
                            // use Vega View API
                        } else if (queryType.includes("Navigation Query")) {
                            // implement later
                            // use hierarchy
                        } else {
                            document.getElementById("prompt").textContent = question;
                            document.getElementById("response").textContent = queryType;
                            questionObj.answer = queryType;
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    // Convert the updated questions dictionary back to CSV string
    const csvData = Papa.unparse(Object.entries(questionsDictionary).flatMap(([key, value]) => {
        return value.map(questionObj => ({
            Stimuli: key,
            Questions: questionObj.question,
            Answer: questionObj.answer.toString() // Include the answer in the CSV output
        }));
    }), { header: true });

    // Create a Blob object from the CSV data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });

    // Set the download link href and trigger the click event
    const downloadLink = document.getElementById('download-link');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.setAttribute('download', 'updated_questions.csv');
    downloadLink.click();
});
