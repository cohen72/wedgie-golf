// script.js
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isHoneypotFilled(value) {
  return value.trim().length > 0;
}

function buildFormBody(email, source) {
  const params = new URLSearchParams();
  params.set("email", email.trim());
  params.set("source", source);
  return params.toString();
}

function loopsEndpoint(formId) {
  return "https://app.loops.so/api/newsletter-form/" + formId;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidEmail, isHoneypotFilled, buildFormBody, loopsEndpoint };
}
