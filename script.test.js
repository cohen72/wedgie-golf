// script.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { isValidEmail, isHoneypotFilled, buildFormBody, loopsEndpoint } = require("./script.js");

test("isValidEmail accepts a normal address", () => {
  assert.equal(isValidEmail("oren@example.com"), true);
});

test("isValidEmail rejects a string with no @", () => {
  assert.equal(isValidEmail("not-an-email"), false);
});

test("isValidEmail rejects a string with no domain", () => {
  assert.equal(isValidEmail("oren@"), false);
});

test("isHoneypotFilled is false for an empty value", () => {
  assert.equal(isHoneypotFilled(""), false);
});

test("isHoneypotFilled is true when a bot fills the hidden field", () => {
  assert.equal(isHoneypotFilled("some spam text"), true);
});

test("buildFormBody url-encodes the email and includes source and userGroup", () => {
  const body = buildFormBody("oren+test@example.com", "waitlist-website", "wedgie");
  assert.equal(body, "email=oren%2Btest%40example.com&source=waitlist-website&userGroup=wedgie");
});

test("loopsEndpoint builds the newsletter-form URL from a form id", () => {
  assert.equal(
    loopsEndpoint("abc123"),
    "https://app.loops.so/api/newsletter-form/abc123"
  );
});
