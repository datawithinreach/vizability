// Preprocessing
import { lineChartVLSpec, barChartVLSpec, scatterPlotVLSpec, mapVLSpec } from "./testChartVLSpecs.js";

import Tree from "./tree.js";

const vegaLiteSpecDict = {
    s1: barChartVLSpec,
    s2: lineChartVLSpec,
    s3: scatterPlotVLSpec
    // s4: mapVLSpec,
}

const vegaLiteHierarchyDict = {
    s1: null,
    s2: null,
    s3: null
    // s4: null
}

async function preprocess(vegaLiteSpecDict, vegaLiteHierarchyDict) {
    for (const property in vegaLiteSpecDict) {
        // console.log(property);
        const vegaSpec = vegaLite.compile(vegaLiteSpecDict[property]).spec;
        const runtime = vega.parse(vegaSpec);
        const vegaContainer = document.getElementById("vega-container");
        const view = new vega.View(runtime)
            .logLevel(vega.Warn)
            .initialize(vegaContainer)
            .renderer("svg")
            .hover()
            .run();

        const olliContainer = document.getElementById("olli-container");
        const olliVisSpec = await OlliAdapters.VegaLiteAdapter(vegaLiteSpecDict[property]);
        const olliRender = olli(olliVisSpec);
        olliContainer.innerHTML = "";
        olliContainer.append(olliRender);

        const tree = new Tree(document.querySelector('.olli-vis'));

        tree.getHierarchy((hierarchy) => {
            // Pass the hierarchy
            console.log(hierarchy);
            vegaLiteHierarchyDict[property] = hierarchy;
          });
    }

    console.log(vegaLiteHierarchyDict); // Log the final dictionary
}

async function getQuestions() {
    const filePath = "./testData/testQuestions.csv"
    return fetch("/api/get-backend-file?file_path=" + filePath)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const sanitizedContents = data.contents;
            return sanitizedContents.substring(3, sanitizedContents.length);
        })
}

document.getElementById("testButton").addEventListener("click", async function () {
    const questionsContent = await getQuestions();
    await preprocess(vegaLiteSpecDict, vegaLiteHierarchyDict);
    console.log(vegaLiteHierarchyDict);
});
