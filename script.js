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

// Replace with the real Form ID from https://app.loops.so/forms once the
// "Wedgie Waitlist" form is created — see README.md "Loops setup".
var LOOPS_FORM_ID = "REPLACE_WITH_LOOPS_FORM_ID";

function showMessage(el, type, text) {
  el.textContent = text;
  el.classList.remove("success", "error");
  if (type) el.classList.add(type);
}

function initWaitlistForm(doc) {
  doc = doc || document;
  var form = doc.getElementById("waitlist-form");
  var emailInput = doc.getElementById("email");
  var honeypot = doc.getElementById("company");
  var message = doc.getElementById("form-message");
  var button = form.querySelector(".submit-button");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isHoneypotFilled(honeypot.value)) {
      showMessage(message, "success", "You're on the list. We'll email you the moment it's live.");
      form.reset();
      return;
    }

    if (!isValidEmail(emailInput.value)) {
      showMessage(message, "error", "That doesn't look like a valid email.");
      return;
    }

    button.disabled = true;
    showMessage(message, "", "");

    fetch(loopsEndpoint(LOOPS_FORM_ID), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: buildFormBody(emailInput.value, "waitlist-website"),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (response.ok && data.success) {
            showMessage(message, "success", "You're on the list. We'll email you the moment it's live.");
            form.reset();
          } else {
            showMessage(message, "error", "Something went wrong — try again in a minute.");
            button.disabled = false;
          }
        });
      })
      .catch(function () {
        showMessage(message, "error", "Something went wrong — try again in a minute.");
        button.disabled = false;
      });
  });
}

if (typeof document !== "undefined") {
  initWaitlistForm();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidEmail, isHoneypotFilled, buildFormBody, loopsEndpoint };
}
