import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: link, error } = await supabase
    .from("links")
    .select("id, destination, scan_count")
    .eq("slug", slug)
    .single();

  if (error || !link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Increment scan_count asynchronously (fire-and-forget)
  supabase
    .from("links")
    .update({ scan_count: link.scan_count + 1 })
    .eq("slug", slug)
    .then(() => {});

  return NextResponse.redirect(link.destination, { status: 302 });
}
