// app/api/favorites/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("item_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      return NextResponse.json(
        { error: "Failed to fetch favorites" },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorites: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in GET /api/favorites:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const itemId: string | undefined = body.itemId;
    const action: "add" | "remove" = body.action;

    if (!itemId || !action) {
      return NextResponse.json(
        { error: "itemId and action are required" },
        { status: 400 }
      );
    }

    if (action === "add") {
      const { error } = await supabase
        .from("favorites")
        .upsert(
          { user_id: user.id, item_id: itemId },
          { onConflict: "user_id,item_id" }
        );

      if (error) {
        console.error("Error adding favorite:", error);
        return NextResponse.json(
          { error: "Failed to add favorite" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (action === "remove") {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId);

      if (error) {
        console.error("Error removing favorite:", error);
        return NextResponse.json(
          { error: "Failed to remove favorite" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Unexpected error in POST /api/favorites:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
