import Pusher from "pusher";

const ALLOWED = ["seeker", "catalyst", "anchor", "builder", "sage", "confluence"];
const REQUIRED_ENV = ["PUSHER_APP_ID", "PUSHER_SECRET", "VITE_PUSHER_KEY", "VITE_PUSHER_CLUSTER"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const archetype = String(req.body?.archetype || "").trim().toLowerCase();
  if (!ALLOWED.includes(archetype)) return res.status(400).json({ ok: false });

  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error("report-result: missing env vars:", missing.join(", "));
    return res.status(500).json({ ok: false, error: "not configured" });
  }

  try {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.VITE_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.VITE_PUSHER_CLUSTER,
      useTLS: true,
    });
    await pusher.trigger("myndcheck-live", "result", { archetype });
    return res.status(200).json({ ok: true });
  } catch {
    console.error("report-result: pusher trigger failed");
    return res.status(500).json({ ok: false });
  }
}
