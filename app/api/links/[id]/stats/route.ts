import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { resolveDateRange, buildDayChartData, computeSummary } from "@/lib/stats";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.userId;
  const { id } = await params;

  const { data: link } = await supabase
    .from("links")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const { fromDate, days } = resolveDateRange({
    period: searchParams.get("period") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const { data, error } = await supabase
    .from("scan_events")
    .select("scanned_at")
    .eq("link_id", id)
    .gte("scanned_at", fromDate.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dayData = buildDayChartData(data ?? [], fromDate, days);
  const summary = computeSummary(dayData);

  return NextResponse.json({ data: dayData, summary });
}
