// Device memory for "you've already taken this" recognition on Intro
// (see hooks/useStoredResult.js). Deliberately localStorage, not
// sessionStorage, it needs to survive a closed browser. Every call is a
// no-op on failure (private browsing, storage disabled), this is a
// progressive enhancement, never a requirement for the quiz to work.
const STORAGE_KEY = "consciousCheck_resultToken";

export function getStoredToken() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// Only one token is ever kept, a retake overwrites it rather than
// accumulating history, see FeedbackModal/CLAUDE.md note on the open
// product question of whether retake history should be tracked later.
export function setStoredToken(token) {
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

export function clearStoredToken() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
