// use fetch to send a request to the backend /prompt with the parameter text 
// and display the text in the div with id="prompt"
// and then display the response in the div with id="response"

function sendPrompt() {
    // var text = document.getElementById("prompt").value;
    const text = "Tell me what to do in Maldives"
    console.log("prompt", text);
    fetch("/prompt?text=" + text)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log("response", data);
            document.getElementById("prompt").textContent = data.prompt;
            document.getElementById("response").textContent = data.response;
        });
}
sendPrompt();

