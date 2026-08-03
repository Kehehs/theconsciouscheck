// Self-contained, signed result token for the /check/r/:token permalink
// (see pages/Result.jsx). No backend or database exists for this portal
// (static Vite app on Vercel, the only server-side piece is the feedback
// flow's Apps Script write endpoint, which has nothing to do with
// results), so the result is encoded into the URL itself rather than
// looked up from storage: token = base64url(payload).base64url(HMAC).
//
// payload only carries the 15 raw quiz answers (1-5 each), not the
// derived scores, decodeResultToken() re-runs scoreQuiz() on them, the
// same pure function used at quiz-completion time, so a token can never
// drift out of sync with "what the result actually was" the way a
// separately-encoded copy of the scores could.
//
// The HMAC is a tamper-evidence measure, not an access-control secret:
// this is a fully client-side static app, so the signing key ships in
// the JS bundle and anyone who reads it could forge a token. Its job is
// only to stop someone casually editing their own score in the URL bar
// before sharing it, and to make "flip one character" fail closed
// (generic invalid state) instead of silently rendering a different
// person's result or a different score.
import questions from "../data/questions.json";
import { scoreQuiz } from "./scoring";

const SIGNING_KEY_MATERIAL = "conscious-check-result-token-v1-9f3a7c2e-do-not-reuse-as-a-secret";

let cachedKeyPromise = null;
function getKey() {
  if (!cachedKeyPromise) {
    cachedKeyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SIGNING_KEY_MATERIAL),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return cachedKeyPromise;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(b64url) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice((b64.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * Encodes a completed quiz's raw answers (`{ [questionId]: 1-5 }`) into a
 * URL-safe permalink token. Always well over the 22-character minimum
 * (typically 100+ chars): a ~60-char payload plus a 43-char signature.
 */
export async function encodeResultToken(answers) {
  const orderedValues = questions.map((q) => answers[q.id]);
  const payloadBytes = new TextEncoder().encode(JSON.stringify({ v: 1, a: orderedValues }));
  const payloadB64 = bytesToBase64Url(payloadBytes);

  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const signatureB64 = bytesToBase64Url(new Uint8Array(signature));

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies and decodes a result token. Never throws, any malformed,
 * truncated, tampered, or unrecognised token (wrong version, wrong
 * shape, out-of-range answer values, bad signature) resolves to `null`
 * rather than a stack trace or a partially-rendered result, so a single
 * altered character in the URL fails closed with no data leak.
 */
export async function decodeResultToken(token) {
  try {
    if (typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signatureB64] = parts;
    if (!payloadB64 || !signatureB64) return null;

    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signatureB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
    if (
      payload.v !== 1 ||
      !Array.isArray(payload.a) ||
      payload.a.length !== questions.length ||
      !payload.a.every((v) => Number.isInteger(v) && v >= 1 && v <= 5)
    ) {
      return null;
    }

    const answers = {};
    questions.forEach((q, i) => {
      answers[q.id] = payload.a[i];
    });

    return { answers, result: scoreQuiz(answers) };
  } catch {
    return null;
  }
}
