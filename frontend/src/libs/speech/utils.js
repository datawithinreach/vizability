import isNumber from "lodash/isNumber";
import isEmpty from "lodash/isEmpty";
import random from "lodash/random";
import round from "lodash/round";
import startCase from "lodash/startCase";
import UAParser from "ua-parser-js";
import wordsToNumbers from "words-to-numbers";
import settings from "./settings";
import defaults from "defaults";
import p5 from "p5";
import "p5.js-speech/lib/p5.speech";

//get os
const os = new UAParser().getOS();

export  const capitalize = (string)=>{
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export const sanitizeInquiry = text=>{
  let inquiry = text.slice();
  inquiry = capitalize(inquiry);

  if (inquiry.endsWith("?")){
    return inquiry;
  }else if (inquiry.endsWith(".")){
    return inquiry.slice(0, -1).concat("?");
  }else{
    return inquiry.concat("?");
  }
}
//generate feedback text
// const getFeedbackText = () => {
//   const feedbacks = [
//     "I understand you're looking for",
//     "It seems like you asked about the",
//   ];
//   const randomIndex = random(0, feedbacks.length - 1);

//   return feedbacks[randomIndex];
// };

//find modifiers: key bindings to trigger responds
export const getModifier = (
  settings,
  withSpaces = true,
  uppercase = true,
  joiningCharacter = "+"
) => {
  if (withSpaces) {
    joiningCharacter = " " + joiningCharacter + " ";
  }

  const modifier = settings.multipleModifiers
    ? settings.modifier.join(joiningCharacter)
    : settings.modifier;

  return uppercase ? modifier.toUpperCase() : modifier;
};

//get default setting for variables
//x:independent var
//y:dependent var
//c:categorical var (optional)
export const getDefaults = () => ({
  triggers: {
    mainKey: ["z", "1"],
    instructionsKey: ["i", "4"],
    summaryKey: ["s", "2"],
    pause: ["p", "5"],
  }
});

//Maps the triggers to a human-readable format to be used in instructions.
const getMappedTriggers = (triggers, modifier) => {
  let mappedTriggers = {};

  Object.keys(triggers).forEach((k) => {
    mappedTriggers[k] = triggers[k]
      .map((t) => modifier + " + " + t.toUpperCase())
      .join(" or ");
  });

  return mappedTriggers;
};

//generate instructions
export const getInstructionsText = (triggers, title, settings) => {
  const modifier = getModifier(settings);
  const mappedTriggers = getMappedTriggers(triggers, modifier, settings);
  return `To interact with the graph, press ${mappedTriggers.mainKey} all together and in order. You'll hear a beep sound, after which you can ask a question such as what is the average or what is the maximum value in the graph. To hear the textual summary of the graph, press ${mappedTriggers.summaryKey}. To repeat these instructions, press ${mappedTriggers.instructionsKey}. Key combinations must be pressed all together and in order.`;
};

//generate initial instructions
export const generateInstructions = (triggers, title, settings) => {
  const modifier = getModifier(settings);
  const mappedTriggers = getMappedTriggers(triggers, modifier, settings);
  const label = `Graph with title: ${title}. To listen to instructions on how to interact with the graph, press ${mappedTriggers.instructionsKey}. Key combinations must be pressed all together and in order.`;
  return label;
};

export const generateExplanation = (triggers, settings) => {
  const modifier = getModifier(settings);
  const mappedTriggers = getMappedTriggers(triggers, modifier, settings);
  const label = `Press ${mappedTriggers.mainKey} to ask a question. In case you prefer to type your question, you can write your question in a text box below the chart. To listen to instructions on how to interact with the graph, press ${mappedTriggers.instructionsKey}. Key combinations must be pressed all together and in order.`;
  return label;
};
export const generateTestInstruction = (triggers, settings) => {
  const modifier = getModifier(settings);
  const mappedTriggers = getMappedTriggers(triggers, modifier, settings);
  const label = `To test your microphone, press ${mappedTriggers.mainKey}. You'll hear a beep sound, after which you can say 'I am ready' or whatever you like. The system will echo your voice back to you. Key combinations must be pressed all together and in order.`;
  return label;
};

//validate data format (not used)
// export const validate = (data, options) => {
//   if (isEmpty(options.x)) {
//     throw new TypeError("Independent variable not set.");
//   } else if (isEmpty(options.y)) {
//     throw new TypeError("Dependent variable not set.");
//   } else if (isEmpty(data) || !data.every(isNumber)) {
//     throw new TypeError(
//       "Dependent variable values are missing or not numeric."
//     );
//   } else if (isEmpty(options.title)) {
//     throw new TypeError("Title not set.");
//   }
// };

//get setting according to os
export const getSettings = () => {
  if (os && os.name && os.name.includes("Mac OS")) {
    return settings.MacOS;
  } else if (os && os.name && os.name.includes("Windows")) {
    return settings.Windows;
  } else {
    return settings.default;
  }
};

// export const addFeedbackToResponse = (response, commands) => {
//   commands = verbalise(commands);
//   response = response.replace(/ +(?= )/g, "");

//   return `${getFeedbackText()} ${commands}. ${response}`;
// };

// export const verbalise = (values) => {
//   const total = values.length;

//   if (values.length > 1) {
//     values[total - 1] = `and ${values[total - 1]}`;
//     values = values.join(", ");
//   } else {
//     values = values[0];
//   }

//   return values;
// };

export const getKeyBinds = (listeningKeys, combinations) =>
  combinations.map((c) => listeningKeys + "+" + c).join(",");

export const logKeyPresses = (listeningKeys, event) => {
  const key = getKeyFromEvent(event);
  const combination = listeningKeys + "+" + key;

  console.log("[Voice sys] Key combination issued: " + combination);

  let keyCombinationsPressed =
    window.localStorage.getItem("keyCombinationsPressed") || "[]";

  keyCombinationsPressed = JSON.parse(keyCombinationsPressed);
  keyCombinationsPressed.push({ combination, time: Date.now() });

  window.localStorage.setItem(
    "keyCombinationsPressed",
    JSON.stringify(keyCombinationsPressed)
  );
};

export const logCommand = (command, response) => {
  console.log("[Voice sys] Command issued: " + command);

  let commandsIssued = window.localStorage.getItem("commandsIssued") || "[]";

  commandsIssued = JSON.parse(commandsIssued);
  commandsIssued.push({ command, response, time: Date.now() });

  window.localStorage.setItem("commandsIssued", JSON.stringify(commandsIssued));
};

export const getKeyFromEvent = (event) =>
  event.code.toLowerCase().replace("key", "").replace("digit", "");

export const sanitizeVoiceText = (voiceText) => {
  voiceText = voiceText.replace(/(\d+)(st|nd|rd|th)/, "$1");
  voiceText = voiceText.replaceAll("'s", "");
  voiceText = voiceText
    .split(" ")
    .filter(
      (v) =>
        (Number.isInteger(parseInt(wordsToNumbers(v))) ||
          v.trim().length > 2) &&
        !stopWords.includes(v)
    )
    .join(" ")
    .trim();

  return voiceText;
};

const stopWords = [
  "a",
  "able",
  "about",
  "across",
  "after",
  "all",
  "almost",
  "also",
  "am",
  "among",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "but",
  "by",
  "can",
  "cannot",
  "could",
  "dear",
  "did",
  "do",
  "does",
  "either",
  "else",
  "ever",
  "every",
  "for",
  "from",
  "get",
  "got",
  "had",
  "has",
  "have",
  "he",
  "her",
  "hers",
  "him",
  "his",
  "how",
  "however",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "let",
  "like",
  "likely",
  "may",
  "me",
  "might",
  "must",
  "my",
  "neither",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "often",
  "on",
  "only",
  "or",
  "other",
  "our",
  "own",
  "rather",
  "said",
  "say",
  "says",
  "she",
  "should",
  "since",
  "so",
  "some",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "tis",
  "to",
  "too",
  "twas",
  "us",
  "wants",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "would",
  "yet",
  "you",
  "your",
  "ain't",
  "aren't",
  "can't",
  "could've",
  "couldn't",
  "didn't",
  "doesn't",
  "don't",
  "hasn't",
  "he'd",
  "he'll",
  "he's",
  "how'd",
  "how'll",
  "how's",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "isn't",
  "it's",
  "might've",
  "mightn't",
  "must've",
  "mustn't",
  "shan't",
  "she'd",
  "she'll",
  "she's",
  "should've",
  "shouldn't",
  "that'll",
  "that's",
  "there's",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "wasn't",
  "we'd",
  "we'll",
  "we're",
  "weren't",
  "what'd",
  "what's",
  "when'd",
  "when'll",
  "when's",
  "where'd",
  "where'll",
  "where's",
  "who'd",
  "who'll",
  "who's",
  "why'd",
  "why'll",
  "why's",
  "won't",
  "would've",
  "wouldn't",
  "you'd",
  "you'll",
  "you're",
  "you've",
];
