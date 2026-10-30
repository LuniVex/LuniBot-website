"use client";
import { useEffect, useSyncExternalStore } from "react";
import type { BotStats, Votes } from "./analytics";
import { fetchJson } from "./fetch-json";

/**
 * The one copy of each bot's figures in the browser. Every number on a page (hub card, bot-page facts,
 * the stats panel, the upvote button) reads from here, so they can't disagree. Figures come from
 * /api/stats or /api/stats/[slug], which share one server function, and are never cached.
 */
export interface Entry { data: BotStats | null; failed: boolean }

const EMPTY: Entry = { data: null, failed: false };
const cache = new Map<string, Entry>();
const listeners = new Set<() => void>();

const put = (slug: string, entry: Entry) => { cache.set(slug, entry); listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

async function loadAll() {
  try {
    const all = await fetchJson<Record<string, BotStats>>("/api/stats");
    for (const [slug, data] of Object.entries(all)) put(slug, { data, failed: false });
  } catch {
    // Keep whatever is on screen; mark bots with no figures yet as unavailable.
    for (const slug of cache.keys()) if (!cache.get(slug)?.data) put(slug, { data: null, failed: true });
    put("*", { data: null, failed: true });
  }
}

async function load(slug: string) {
  try { put(slug, { data: await fetchJson<BotStats>(`/api/stats/${slug}`), failed: false }); }
  catch { put(slug, { data: cache.get(slug)?.data ?? null, failed: true }); }
}

/** Fetches one bot's figures again, e.g. after a failed load. */
export const reloadStats = (slug: string) => void load(slug);

/** Fetches fresh figures when the component mounts: every bot ("all") or one. */
export function useLoadStats(which: "all" | string) {
  useEffect(() => { void (which === "all" ? loadAll() : load(which)); }, [which]);
}

/** One bot's figures. On the hub, a failed load of all bots counts as failed for each. */
export function useStats(slug: string): Entry {
  return useSyncExternalStore(subscribe, () => {
    const own = cache.get(slug);
    if (own) return own;
    return cache.get("*")?.failed ? cache.get("*")! : EMPTY;
  }, () => EMPTY);
}

/** Puts a vote result (optimistic or from the server) into the shared copy. */
export function setVotes(slug: string, votes: Votes) {
  const cur = cache.get(slug);
  if (cur?.data) put(slug, { data: { ...cur.data, votes }, failed: false });
}

/** A download was just started: the server counts it before redirecting, so re-read shortly after. */
export function afterDownload(slug: string) {
  setTimeout(() => void load(slug), 1200);
}
