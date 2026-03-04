const test = require("node:test");
const assert = require("node:assert/strict");
const { includesBlockedWord, maskBlockedWords, normalizeText } = require("./lib/moderation");

test("normalizeText strips punctuation and spaces", () => {
  assert.equal(normalizeText("B.a d w o r d!!!"), "badword");
});

test("includesBlockedWord catches obfuscated words", () => {
  assert.equal(includesBlockedWord("I h-a-t-e this"), true);
});

test("maskBlockedWords replaces exact blocked word appearances", () => {
  assert.equal(maskBlockedWords("That is stupid"), "That is ******");
});
