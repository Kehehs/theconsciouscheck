// Write endpoint for the result-page feedback flow (FeedbackModal.jsx).
// Points at a Google Apps Script Web App bound to the feedback sheet
// (1AXKiKO0JqKRyjg3_atKn6SFSbbeIJVSxqUu0QmUM_1s, tab "Form Responses 1").
// See google-apps-script/feedback-submit.gs for the deployed script source.
const FEEDBACK_ENDPOINT = import.meta.env.VITE_FEEDBACK_SCRIPT_URL;

const TIMEOUT_MS = 9000;

// Sent as text/plain (not application/json) so this stays a CORS "simple
// request" and skips the preflight OPTIONS call, which Apps Script web
// apps don't answer, the script still parses the body as JSON regardless
// of the declared content type (see feedback-submit.gs). Apps Script web
// apps deployed with "Anyone" access serve simple cross-origin requests
// like this one with the response readable (no explicit CORS headers
// needed on the script side), so response.ok can be checked directly.
export async function submitFeedback(answers) {
  if (!FEEDBACK_ENDPOINT) {
    throw new Error("VITE_FEEDBACK_SCRIPT_URL is not configured.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(answers),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Feedback submit failed with status ${response.status}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
