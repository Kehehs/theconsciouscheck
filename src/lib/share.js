// Share helpers for the result page's Share control (replaces the old
// standalone "Copy link" button — see pages/Result.jsx).
//
// navigator.share/navigator.canShare only exist in secure contexts
// (HTTPS, or http://localhost during dev) per the Web Share API spec:
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share.
// canShareNatively() already returns false off-HTTPS since the API is
// simply undefined there — no separate protocol check needed.

// Placeholder tracked-link structure — swap the host once the real
// redirect service exists, nothing else here needs to change.
const TRACKED_LINK_BASE = "https://imalcares.org/s";

export function buildShareUrl(archetypeId, platform) {
  const url = new URL(`${TRACKED_LINK_BASE}/${archetypeId}`);
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "share");
  return url.toString();
}

export function buildShareText(archetypeName) {
  return `I got ${archetypeName} on the Conscious Check. Find out yours.`;
}

export const SHARE_TITLE = "Check Your Consciousness";

export function canShareNatively() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/**
 * Native share is a mobile-sheet UX (iOS Safari / Android Chrome). Some
 * desktop browsers now expose navigator.share too, but per spec here
 * desktop should always land on the fallback grid instead of popping a
 * one-item OS share sheet.
 */
export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPod|iPad/i.test(ua)) return true;
  // iPadOS 13+ identifies as "Macintosh" but is touch-capable, unlike a real Mac.
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

async function fetchCardImageFile(archetype) {
  const response = await fetch(archetype.cardImage);
  const blob = await response.blob();
  return new File([blob], `conscious-check-${archetype.id}.webp`, {
    type: blob.type || "image/webp",
  });
}

export async function downloadCardImage(archetype) {
  const response = await fetch(archetype.cardImage);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `conscious-check-${archetype.id}.webp`;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

/**
 * Invokes the native OS share sheet for an archetype result. Tries to
 * attach the card image as a file first (per navigator.canShare's file
 * support, not guaranteed on every browser), falls back to a link+text
 * share if the file can't be attached or isn't shareable there.
 *
 * Returns true once the share sheet was successfully invoked (including
 * the user cancelling it — that's a completed interaction, not a
 * failure to route to the fallback grid). Returns false only when native
 * share genuinely isn't usable, so the caller should fall back to the grid.
 */
export async function shareResult(archetype) {
  if (!canShareNatively()) return false;

  const url = buildShareUrl(archetype.id, "native");
  const text = buildShareText(archetype.name);
  const shareData = { title: SHARE_TITLE, text, url };

  try {
    const file = await fetchCardImageFile(archetype);
    const withFile = { ...shareData, files: [file] };
    if (navigator.canShare && navigator.canShare(withFile)) {
      await navigator.share(withFile);
      return true;
    }
  } catch (err) {
    if (err?.name === "AbortError") return true;
    console.error("Native share with image failed, falling back to link-only share", err);
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (err) {
    if (err?.name === "AbortError") return true;
    console.error("Native share failed", err);
    return false;
  }
}

export function deepLinkFor(platformId, { url, text }) {
  switch (platformId) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    default:
      return null;
  }
}
