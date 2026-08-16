import { useEffect, useRef, useState } from "react";
import uiStrings from "../data/uiStrings.json";
import {
  buildShareUrl,
  buildShareText,
  canShareNatively,
  isMobileDevice,
  shareResult,
  deepLinkFor,
  downloadCardImage,
} from "../lib/share";

// Platform grid shown when native share isn't available/appropriate
// (desktop always, or mobile browsers without navigator.share). No
// Instagram deep-link exists for posting content, so it's handled as a
// download + on-screen instruction instead of a window.open() link.
const PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "x", label: "X" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "telegram", label: "Telegram" },
  { id: "instagram", label: "Instagram" },
  { id: "download", label: "Download" },
  { id: "copy", label: "Copy link" },
];

export default function ShareButton({ archetype, language }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instagramHint, setInstagramHint] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handlePrimaryClick = async () => {
    // Native share is only attempted on mobile — desktop browsers that
    // expose navigator.share still get the fallback grid per spec.
    if (canShareNatively() && isMobileDevice()) {
      const shared = await shareResult(archetype);
      if (!shared) setOpen(true);
      return;
    }
    setOpen((wasOpen) => !wasOpen);
  };

  const handlePlatformClick = async (platformId) => {
    const url = buildShareUrl(archetype.id, platformId);
    const text = buildShareText(archetype.name);

    if (platformId === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy result link", err);
      }
      return;
    }

    if (platformId === "download" || platformId === "instagram") {
      try {
        await downloadCardImage(archetype);
        if (platformId === "instagram") {
          setInstagramHint(true);
          setTimeout(() => setInstagramHint(false), 5000);
        } else {
          setDownloaded(true);
          setTimeout(() => setDownloaded(false), 2000);
        }
      } catch (err) {
        console.error("Failed to download card image", err);
      }
      return;
    }

    const href = deepLinkFor(platformId, { url, text });
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handlePrimaryClick}
        aria-expanded={open}
        className="min-h-[48px] rounded-full border border-tint-blue/30 bg-transparent px-6 py-3 font-body text-sm font-bold text-tint-blue"
      >
        {uiStrings.share[language]}
      </button>

      {open && (
        <div
          className="absolute left-1/2 top-[calc(100%+10px)] z-10 w-[300px] -translate-x-1/2 rounded-2xl border border-tint-blue/20 bg-navy-deep p-4 shadow-2xl"
          style={{ boxShadow: "0 20px 50px -15px rgba(0,0,0,0.7)" }}
        >
          <div className="grid grid-cols-4 gap-2">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => handlePlatformClick(platform.id)}
                className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-tint-blue/15 bg-navy-primary/60 px-1 py-2 font-body text-[11px] font-semibold text-pale-tint transition-colors hover:border-amber-soft/50 hover:text-amber-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-soft active:scale-95"
              >
                <PlatformIcon id={platform.id} />
                <span className="leading-tight">
                  {platform.id === "copy" && copied
                    ? uiStrings.linkCopied[language]
                    : platform.id === "download" && downloaded
                      ? uiStrings.shareDownloadedImage[language]
                      : platform.label}
                </span>
              </button>
            ))}
          </div>

          {instagramHint && (
            <p className="mt-3 text-center font-body text-xs leading-snug text-amber-soft">
              {uiStrings.shareInstagramHint[language]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PlatformIcon({ id }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "currentColor" };
  switch (id) {
    case "whatsapp":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.8 14.24c-.24.68-1.4 1.3-1.93 1.35-.5.06-1.13.08-1.83-.12-.42-.12-.96-.31-1.66-.6-2.92-1.26-4.83-4.2-4.98-4.4-.15-.2-1.2-1.6-1.2-3.06s.77-2.17 1.05-2.47c.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.24.58.83 2 .9 2.15.07.15.11.32.02.52-.09.2-.14.32-.28.5-.14.17-.29.38-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.23.6-.14.24.09 1.55.73 1.82.87.27.14.45.2.51.32.06.11.06.66-.18 1.34Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M18.24 3H21l-6.55 7.49L22.2 21h-6.36l-4.98-6.5L5.13 21H2.35l7.01-8.01L1.8 3h6.51l4.5 5.95L18.24 3Zm-1.12 16.2h1.5L7.02 4.7H5.4l11.72 14.5Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.4c0-.87.24-1.46 1.5-1.46H16.6V4.35C16.34 4.31 15.44 4.24 14.4 4.24c-2.17 0-3.66 1.32-3.66 3.75v2.51H8.24v3h2.5V21h2.76Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.25a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 20h-3.37v-6.06c0-1.45-.03-3.3-2.01-3.3-2.02 0-2.33 1.58-2.33 3.2V20H9.36V8.5h3.24v1.57h.05c.45-.85 1.56-1.75 3.2-1.75 3.42 0 4.06 2.25 4.06 5.18V20Z" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M21.5 4.5 3.4 11.4c-1.2.48-1.2 1.15-.22 1.45l4.63 1.45 1.8 5.5c.22.55.44.77.9.77.46 0 .66-.2.9-.44l2.16-2.1 4.5 3.32c.83.46 1.42.22 1.64-.77l2.97-14c.32-1.2-.45-1.75-1.18-1.42Zm-3.35 3.53L9.5 14.13l-.35 3.6-1.5-4.6 10.5-6.6c.4-.25.77-.11.5.2Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 2.16c2.67 0 2.99.01 4.04.06 2.7.12 3.96 1.4 4.08 4.08.05 1.05.06 1.37.06 4.03s-.01 2.98-.06 4.03c-.12 2.67-1.37 3.96-4.08 4.08-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06c-2.72-.12-3.96-1.41-4.08-4.08-.05-1.05-.06-1.37-.06-4.03s.01-2.98.06-4.03c.12-2.68 1.37-3.96 4.08-4.08 1.05-.05 1.37-.06 4.04-.06ZM12 0C9.28 0 8.94.01 7.87.06c-3.6.17-5.6 2.15-5.77 5.77C2.05 6.9 2.04 7.24 2.04 9.96v4.08c0 2.72.01 3.06.06 4.13.17 3.6 2.15 5.6 5.77 5.77 1.07.05 1.41.06 4.13.06s3.06-.01 4.13-.06c3.6-.17 5.6-2.15 5.77-5.77.05-1.07.06-1.41.06-4.13V9.96c0-2.72-.01-3.06-.06-4.13-.17-3.6-2.15-5.6-5.77-5.77C15.06.01 14.72 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
        </svg>
      );
    case "download":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    default:
      return null;
  }
}
