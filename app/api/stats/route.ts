import { NextResponse, type NextRequest } from "next/server";
import { getStats, type BotStats } from "@/lib/analytics";
import { failed, noStore } from "@/lib/api";
import { bots } from "@/lib/bots";
import { visitorOf, withVisitor } from "@/lib/visitor";

export const dynamic = "force-dynamic";

/** Figures for every bot, for the hub. Same shape as /api/stats/[slug], from the same function. */
export async function GET(req: NextRequest) {
  try {
    const visitor = visitorOf(req);
    const rows = await Promise.all(bots.map(async (b) => [b.slug, await getStats(b.slug, visitor.id)] as const));
    return withVisitor(NextResponse.json(Object.fromEntries(rows) as Record<string, BotStats>, { headers: noStore }), visitor);
  } catch (err) {
    return failed(err);
  }
}
