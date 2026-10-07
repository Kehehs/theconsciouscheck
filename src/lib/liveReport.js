const KEY = "mc_event";
const REPORTED_KEY = "mc_reported";

// Call once on app load. If the URL has ?event=..., remember it for this tab.
export function captureEventFlag() {
  try {
    const p = new URLSearchParams(window.location.search).get("event");
    if (p) sessionStorage.setItem(KEY, p);
  } catch {}
}

// Reports a finished quiz to the live dashboard. Only fires for event
// attendees, never blocks, never throws.
export function reportResult(archetypeId) {
  try {
    if (sessionStorage.getItem(KEY) !== "awc") return;
    // One count per browser tab: a retake or a re-scan in the same tab
    // doesn't count again. Set before the fetch so it can't double fire.
    if (sessionStorage.getItem(REPORTED_KEY)) return;
    sessionStorage.setItem(REPORTED_KEY, "1");
    fetch("/api/report-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archetype: archetypeId }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
