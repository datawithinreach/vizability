document.addEventListener("DOMContentLoaded", () => {
    let monitoringClicksTextRepresentation = false; // Flag to control when to monitor clicks
    let monitoringClicksExampleQuestions = false; // Flag to control when to monitor clicks
    let exampleQuestionsClickCounter = 0;
    let monitoringClicksOlliTreeview = false;
    let monitoringClicksDataTable = false;
    let tutorial = false;
    let formSubmitCount = 0;

    function scrollToTargetElement(elementId) {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth', // Smooth scroll
                block: 'start' // Align the top of the element to the top of the scrollable area
            });
        } else {
            console.error('Element with id ' + elementId + ' not found.');
        }
    }

    // Event listener for "Skip Tutorial" button
    document.getElementById("skip-tutorial").addEventListener("click", function () {
        document.querySelector(".overlay").style.display = "none";
        tutorial = false;
    });

    // Event listener for "Let's get started" button
    document.getElementById("get-started").addEventListener("click", function () {
        tutorial = true;
        const overlayContent = document.getElementById("overlay-content");
        overlayContent.style.display = "none";

        // Show instructional text for buttons
        const instructionText = document.getElementById("instruction-text");
        instructionText.style.display = "block";

        const buttons = document.querySelectorAll(".dynamic-button");

        buttons.forEach(button => {
            // Set higher z-index for the button
            button.style.position = "relative";
            button.style.zIndex = "9993";
        });

        // Add event listener to remove instructional text and reset z-index when any dynamic button is clicked
        buttons.forEach(button => {
            button.addEventListener("click", function () {
                // Reset button z-index
                buttons.forEach(btn => {
                    btn.style.zIndex = "auto";
                });
                if (tutorial) {
                    // Remove instructional text
                    instructionText.style.display = "none";

                    // Show instructional text for SVG
                    const svgInstructionText = document.getElementById("svg-instruction-text");
                    svgInstructionText.style.display = "block";

                    // Bring SVG container to the foreground
                    const vegaContainer = document.getElementById("vega-container");
                    vegaContainer.style.position = "relative";
                    vegaContainer.style.zIndex = "9994";

                    // Set flag to start monitoring clicks
                    monitoringClicksTextRepresentation = true;
                }
            });
        });
    });

    // Event listener to remove SVG instructional text and show Olli instruction text on click
    document.addEventListener("click", function (event) {
        if (monitoringClicksTextRepresentation) {
            const svgInstructionText = document.getElementById("svg-instruction-text");
            // if (svgInstructionText.style.display === "block" && event.target.id === "#close-overlay") {
                
            // }
            if (svgInstructionText.style.display === "block" && !event.target.closest(".dynamic-button") && event.target.id != 'close-overlay') {
                svgInstructionText.style.display = "none";
                const olliInstructionText = document.getElementById("olli-instruction-text");
                olliInstructionText.style.display = "block";

                scrollToTargetElement("toggle-table");

                // Stop monitoring clicks after displaying Olli instruction text
                monitoringClicksTextRepresentation = false;

                const vegaContainer = document.getElementById("vega-container");
                vegaContainer.style.zIndex = "auto";

                const accordionContainer = document.getElementById("accordion-container");
                accordionContainer.style.display = "block";
                accordionContainer.style.zIndex = "9995";

                monitoringClicksExampleQuestions = true;
                monitoringClicksOlliTreeview = true;
                monitoringClicksDataTable = true;
            }
        }
    });

    // Event listener to handle clicks for showing example questions instructional text
    document.addEventListener("click", function (event) {
        if (monitoringClicksExampleQuestions) {
            const olliInstructionText = document.getElementById("olli-instruction-text");
            if (!event.target.closest(".accordion-item") && event.target.id != 'close-overlay') {
                exampleQuestionsClickCounter++;

                // Check if it's the second click
                if (exampleQuestionsClickCounter === 2) {
                    olliInstructionText.style.display = "none";
                    const questionExampleInstructionText = document.getElementById("question-example-instruction-text");
                    questionExampleInstructionText.style.display = "block";

                    scrollToTargetElement("suggestion-button-4");

                    // Stop monitoring clicks after displaying QnA instruction text
                    monitoringClicksExampleQuestions = false;

                    const accordionContainer = document.getElementById("accordion-container");
                    accordionContainer.style.zIndex = "auto";

                    const olliTreeviewInstructionText = document.getElementById("olli-treeview-instruction-text");
                    olliTreeviewInstructionText.style.display = "none";
                    const dataTableInstructionText = document.getElementById("data-table-instruction-text");
                    dataTableInstructionText.style.display = "none";

                    const suggestionContainer = document.getElementById("suggestion-container");
                    suggestionContainer.style.zIndex = 9995;
                    const qnaDiv = document.getElementById("qna-div");
                    const qnaHeader = document.getElementById("QnA-header");
                    qnaDiv.style.zIndex = 9995;
                    qnaHeader.style.color = "#FAF9F6";

                }
            }
        }
    });

    // Event listener to handle clicks for showing example questions instructional text
    toggleOlli = document.getElementById("toggle-olli");
    toggleOlli.addEventListener("click", function (event) {
        if (monitoringClicksOlliTreeview) {
            const olliInstructionText = document.getElementById("olli-instruction-text");
            const dataTableInstructionText = document.getElementById("data-table-instruction-text");
            if (olliInstructionText.style.display === "block" || dataTableInstructionText.style.display === "block") {

                olliInstructionText.style.display = "none";
                const olliTreeviewInstructionText = document.getElementById("olli-treeview-instruction-text");
                olliTreeviewInstructionText.style.display = "block";
                dataTableInstructionText.style.display = "none";

            }
        }
    });

    // Event listener to handle clicks for showing example questions instructional text
    toggleTable = document.getElementById("toggle-table");
    toggleTable.addEventListener("click", function (event) {
        if (monitoringClicksDataTable) {
            const olliInstructionText = document.getElementById("olli-instruction-text");
            const olliTreeviewInstructionText = document.getElementById("olli-treeview-instruction-text");
            if (olliInstructionText.style.display === "block" || olliTreeviewInstructionText.style.display === "block") {

                olliInstructionText.style.display = "none";
                const dataTableInstructionText = document.getElementById("data-table-instruction-text");
                dataTableInstructionText.style.display = "block";
                olliTreeviewInstructionText.style.display = "none";

            }
        }
    });


    // Function to scroll to the bottom of the page
    function scrollToBottom() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Select the <p> element to observe
    const responseElement = document.getElementById('response');

    // Create a MutationObserver to monitor changes to the <p> element
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'subtree') {
                scrollToBottom();

                // Define the click event handler function
                function handleClick(event) {
                    if (tutorial && formSubmitCount < 1) {
                        const loadContentInstructionText = document.getElementById("load-content-instruction-text");
                        loadContentInstructionText.style.display = "none";
                        const personalQuestionInstructionText = document.getElementById("personal-question-instruction-text");
                        personalQuestionInstructionText.style.display = "block";

                        const loadContent = document.getElementById("load-content");
                        loadContent.style.zIndex = "auto";
                        const askQuestion = document.getElementById("ask-question");
                        askQuestion.style.zIndex = "9995";

                    }
                    else if (tutorial && formSubmitCount == 1) {
                        const finishedInstructionText = document.getElementById("finished-instruction-text");
                        finishedInstructionText.style.display = "block";
                        const loadContentInstructionText = document.getElementById("load-content-instruction-text");
                        loadContentInstructionText.style.display = "none";
                        formSubmitCount += 1;

                        document.getElementById("load-content").style.zIndex = "auto";
                        scrollToTargetElement("user-file-select");
                        const buttons = document.querySelectorAll(".dynamic-button");

                        buttons.forEach(button => {
                            // Set higher z-index for the button
                            button.style.position = "relative";
                            button.style.zIndex = "9993";
                        });

                        tutorial = false; 

                        buttons.forEach(button => {
                            button.addEventListener("click", function () {
                                document.getElementById("skip-tutorial").click();
                                document.getElementById("finished-instruction-text").style.display = "none";
                            });
                        });
                    }
                }

                // Define the submit event handler function
                function handleFormSubmit(event) {
                    if (tutorial && formSubmitCount < 1) {
                        event.preventDefault();
                        const askQuestion = document.getElementById("ask-question");
                        const loadContent = document.getElementById("load-content");

                        askQuestion.style.zIndex = "auto";
                        loadContent.style.zIndex = "9995";

                        const loadContentInstructionText = document.getElementById("load-content-instruction-text");
                        loadContentInstructionText.style.display = "block";
                        const personalQuestionInstructionText = document.getElementById("personal-question-instruction-text");
                        personalQuestionInstructionText.style.display = "none";

                        // Remove the click event listener
                        // document.removeEventListener("click", handleClick);
                        // askQuestion.removeEventListener("submit", handleFormSubmit);
                        formSubmitCount += 1;
                    }
                }

                // Add the click event listener
                document.addEventListener("click", handleClick);
                document.getElementById("ask-question").addEventListener("submit", handleFormSubmit);
            }

        });
    });

    // Define the configuration for the observer
    const config = {
        childList: true,
        subtree: true
    };

    // Start observing the <p> element with the configured parameters
    observer.observe(responseElement, config);

    const suggestionButtons = document.querySelectorAll(".suggestion-button");
    suggestionButtons.forEach(suggestionButton => {
        suggestionButton.addEventListener("click", function () {
            if (tutorial) {
                const suggestionContainer = document.getElementById("suggestion-container");
                suggestionContainer.style.zIndex = "auto";
                const qnaDiv = document.getElementById("qna-div");
                const qnaHeader = document.getElementById("QnA-header");
                qnaDiv.style.zIndex = "auto";
                qnaHeader.style.color = "#226291";

                const loadContent = document.getElementById("load-content");
                loadContent.style.zIndex = "9993";
                // loadContent.style.color = "#FAF9F6";

                const questionExampleInstructionText = document.getElementById("question-example-instruction-text");
                questionExampleInstructionText.style.display = "none";
                const loadContentInstructionText = document.getElementById("load-content-instruction-text");
                loadContentInstructionText.style.display = "block";

                scrollToBottom();
            }
        });
    });

    // Event listener for the close button
    document.getElementById("close-overlay").addEventListener("click", function () {
        document.getElementById("skip-tutorial").click();
        document.getElementById("QnA-header").style.color = "#226291";
        const instructionTexts = document.getElementsByClassName("instruction-text");
        for (let i = 0; i < instructionTexts.length; i++) {
            instructionTexts[i].style.display = "none";
        }
    });    
});
