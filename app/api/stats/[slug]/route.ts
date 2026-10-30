import { NextResponse, type NextRequest } from "next/server";
import { getStats } from "@/lib/analytics";
import { failed, noStore, notFound } from "@/lib/api";
import { getBot } from "@/lib/bots";
import { visitorOf, withVisitor } from "@/lib/visitor";

export const dynamic = "force-dynamic";

/** Downloads (total, today, last 7 and 30 days, a 30-day daily series) and votes for one bot. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const bot = getBot((await params).slug);
  if (!bot) return notFound();
  try {
    const visitor = visitorOf(req);
    return withVisitor(NextResponse.json(await getStats(bot.slug, visitor.id), { headers: noStore }), visitor);
  } catch (err) {
    return failed(err);
  }
}
