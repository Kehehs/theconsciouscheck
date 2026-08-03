import { useEffect, useState } from "react";
import { getStoredToken, clearStoredToken } from "../lib/resultStorage";
import { decodeResultToken } from "../lib/resultToken";
import archetypes from "../data/archetypes.json";

/**
 * Backs the Intro page's "you've already done this" recognition state.
 * status: "checking" (brief, resolves in a tick) | "none" (first-time
 * visitor, or a stored token that no longer decodes) | "ready" (a valid
 * token is on this device, safe to offer "View your result").
 *
 * A token that fails to decode (corrupted, tampered, or from an old
 * incompatible payload version) is treated exactly like "no token" and
 * is cleared from storage, this is the "fall back gracefully" edge case,
 * self-contained tokens can't go stale server-side, but the localStorage
 * copy itself can still be bad.
 */
export function useStoredResult() {
  const [state, setState] = useState({ status: "checking", token: null, archetypeName: null });

  useEffect(() => {
    let cancelled = false;
    const token = getStoredToken();
    if (!token) {
      setState({ status: "none", token: null, archetypeName: null });
      return;
    }

    decodeResultToken(token).then((decoded) => {
      if (cancelled) return;
      if (!decoded) {
        clearStoredToken();
        setState({ status: "none", token: null, archetypeName: null });
        return;
      }
      const archetype = archetypes[decoded.result.archetypeId];
      setState({ status: "ready", token, archetypeName: archetype?.name ?? null });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
