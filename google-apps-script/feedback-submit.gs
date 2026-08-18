/**
 * The MyndCheck, result-page feedback flow, write endpoint.
 *
 * Bound to sheet 1AXKiKO0JqKRyjg3_atKn6SFSbbeIJVSxqUu0QmUM_1s, tab
 * "Form Responses 1". Column order: Timestamp, Q1, Q2, Q3, Q4, Q5, Q6.
 * Timestamp is server-generated here, never sent by the client.
 *
 * Deployment (do this from Extensions > Apps Script on that sheet):
 *   1. Paste this file's contents in as the script.
 *   2. Deploy > New deployment > type "Web app".
 *   3. Execute as: Me. Who has access: Anyone (required for the
 *      anonymous front-end fetch call in src/lib/feedback.js, there is
 *      no end-user login in this flow).
 *   4. Copy the deployed web app URL into VITE_FEEDBACK_SCRIPT_URL in
 *      the front-end's .env.local (not committed, see .gitignore).
 *
 * Deployed URL (for Techmint's records):
 *   https://script.google.com/macros/s/AKfycbyc-bBuHT8BFxkaQuE01oSnWQJtLgkTx-aJg7v5auw-vyApnjxeH0R0RzbIZWZx-aNl4A/exec
 *
 * The client posts as text/plain (not application/json) on purpose, to
 * avoid a CORS preflight that Apps Script web apps don't answer
 * reliably, so the body is parsed manually below instead of relying on
 * e.parameter.
 */
function doPost(e) {
  var sheet = SpreadsheetApp
    .openById('1AXKiKO0JqKRyjg3_atKn6SFSbbeIJVSxqUu0QmUM_1s')
    .getSheetByName('Form Responses 1');

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.q1 || '',
    data.q2 || '',
    data.q3 || '',
    data.q4 || '',
    data.q5 || '',
    data.q6 || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
