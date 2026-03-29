import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { slug, destination, label } = body as {
    slug?: string;
    destination?: string;
    label?: string;
  };

  if (!destination) {
    return NextResponse.json(
      { error: "destination is required" },
      { status: 400 }
    );
  }

  try {
    new URL(destination);
  } catch {
    return NextResponse.json(
      { error: "destination must be a valid URL" },
      { status: 400 }
    );
  }

  const resolvedSlug = slug ?? nanoid(8);

  const { data, error } = await supabase
    .from("links")
    .insert({ slug: resolvedSlug, destination, label: label ?? null })
    .select()
    .single();

  if (error) {
    if (
      error.code === "23505" ||
      error.message.toLowerCase().includes("unique")
    ) {
      return NextResponse.json(
        { error: `Slug "${resolvedSlug}" already exists` },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
