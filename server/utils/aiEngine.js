// const natural = require("natural");
// const tokenizer = new natural.WordTokenizer();

// const analyzeDifficulty = (text) => {
//   if (!text || text.length < 5)
//     return { difficulty: "Easy", score: 0, reasoning: "Insufficient data." };

//   const tokens = tokenizer.tokenize(text.toLowerCase());
//   const wordCount = tokens.length;

//   const cognitiveWeights = {
//     recall: ["what", "who", "define", "list"],
//     application: ["how", "explain", "describe", "solve"],
//     synthesis: ["analyze", "evaluate", "compare", "complexity", "architecture"],
//   };

//   const technicalTerms = [
//     "algorithm",
//     "infrastructure",
//     "asynchronous",
//     "concurrency",
//     "polymorphism",
//     "integration",
//     "deployment",
//   ];

//   let bloomScore = 0;
//   let technicalWeight = 0;
//   let matchedBloom = [];
//   let matchedTech = [];

//   tokens.forEach((word) => {
//     if (cognitiveWeights.recall.includes(word)) {
//       bloomScore += 1;
//       matchedBloom.push(word);
//     }
//     if (cognitiveWeights.application.includes(word)) {
//       bloomScore += 3;
//       matchedBloom.push(word);
//     }
//     if (cognitiveWeights.synthesis.includes(word)) {
//       bloomScore += 6;
//       matchedBloom.push(word);
//     }
//     if (technicalTerms.includes(word)) {
//       technicalWeight += 4.5;
//       matchedTech.push(word);
//     }
//   });

//   const score = wordCount * 0.3 + bloomScore + technicalWeight;

//   let difficulty = "Easy";
//   if (score >= 15 && score < 28) difficulty = "Medium";
//   if (score >= 28) difficulty = "Hard";

//   // GENERATE REASONING STRING
//   const bloomReason =
//     matchedBloom.length > 0
//       ? `Cognitive triggers: [${[...new Set(matchedBloom)].join(", ")}]`
//       : "Low cognitive load";
//   const techReason =
//     matchedTech.length > 0
//       ? `Technical density: [${[...new Set(matchedTech)].join(", ")}]`
//       : "General vocabulary";
//   const lengthReason =
//     wordCount > 20 ? "High linguistic complexity" : "Simple sentence structure";

//   const reasoning = `${difficulty} assigned due to: ${bloomReason}; ${techReason}; ${lengthReason}.`;

//   return { difficulty, score: score.toFixed(2), reasoning };
// };

// module.exports = { analyzeDifficulty };

const natural = require("natural");
const tokenizer = new natural.WordTokenizer();

const analyzeDifficulty = (text) => {
  if (!text || text.length < 5) {
    return {
      difficulty: "Easy",
      score: 0,
      reasoning: "Text too short for analysis.",
    };
  }

  const tokens = tokenizer.tokenize(text.toLowerCase());
  const wordCount = tokens.length;

  // Cognitive levels (Bloom's)
  const cognitiveWeights = {
    recall: ["what", "who", "define", "list"],
    application: ["how", "explain", "describe", "solve"],
    synthesis: ["analyze", "evaluate", "compare", "complexity", "architecture"],
  };

  const technicalTerms = [
    "algorithm",
    "infrastructure",
    "asynchronous",
    "concurrency",
    "polymorphism",
    "integration",
    "deployment",
  ];

  let bloomScore = 0;
  let technicalWeight = 0;
  let foundKeywords = [];

  tokens.forEach((word) => {
    if (cognitiveWeights.recall.includes(word)) bloomScore += 1;
    if (cognitiveWeights.application.includes(word)) bloomScore += 3;
    if (cognitiveWeights.synthesis.includes(word)) {
      bloomScore += 6;
      foundKeywords.push(word);
    }
    if (technicalTerms.includes(word)) {
      technicalWeight += 4.5;
      foundKeywords.push(word);
    }
  });

  const score = wordCount * 0.3 + bloomScore + technicalWeight;

  let difficulty = "Easy";
  if (score >= 15 && score < 28) difficulty = "Medium";
  if (score >= 28) difficulty = "Hard";

  // Generate Reasoning
  const reasoning =
    foundKeywords.length > 0
      ? `Complexity high due to keywords: ${[...new Set(foundKeywords)].join(", ")}`
      : "Standard linguistic complexity detected.";

  return {
    difficulty,
    score: score.toFixed(2),
    reasoning,
  };
};

module.exports = { analyzeDifficulty };
