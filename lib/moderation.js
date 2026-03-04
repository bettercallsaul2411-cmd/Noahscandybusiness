const blockedWords = ["badword", "stupid", "idiot", "hate"];

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function includesBlockedWord(content) {
  const compact = normalizeText(content);
  return blockedWords.some((word) => compact.includes(normalizeText(word)));
}

function maskBlockedWords(content) {
  return blockedWords.reduce((updated, word) => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(escapedWord, "gi");
    return updated.replace(expression, "*".repeat(word.length));
  }, content);
}

module.exports = {
  blockedWords,
  normalizeText,
  includesBlockedWord,
  maskBlockedWords
};
