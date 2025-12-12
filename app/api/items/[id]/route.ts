// app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type RouteParams = { params: { id: string } };

// GET single item
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const supabase = (await createSupabaseServerClient()) as any;
  const { id } = params;

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Item not found", details: error?.message },
      { status: 404 }
    );
  }

  return NextResponse.json({ item: data }, { status: 200 });
}

// PUT – update listing (edit page)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const supabase = (await createSupabaseServerClient()) as any;
  const { id } = params;

  const body = await req.json();
  let {
    title,
    price,
    category,
    condition,
    location,
    description,
    phone,
    imageUrls,
  } = body;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // build partial update object
  const update: any = {};

  if (title !== undefined) update.title = title;
  if (location !== undefined) update.location = location;
  if (description !== undefined) update.description = description;
  if (phone !== undefined) update.phone = phone;

  if (category !== undefined) {
    update.category =
      typeof category === "string" ? category.toLowerCase() : category;
  }
  if (condition !== undefined) {
    update.condition =
      typeof condition === "string" ? condition.toLowerCase() : condition;
  }

  if (price !== undefined) {
    const numericPrice =
      typeof price === "string" ? Number(price.replace(/[^0-9.]/g, "")) : price;
    if (!numericPrice || Number.isNaN(numericPrice)) {
      return NextResponse.json(
        { error: "Price must be a valid number" },
        { status: 400 }
      );
    }
    update.price_eur = numericPrice;
  }

  if (imageUrls !== undefined) {
    update.image_urls = imageUrls;
  }

  const { data, error } = await supabase
    .from("items")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id) // only owner can edit
    .select()
    .single();

  if (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { error: "Update failed", details: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ item: data }, { status: 200 });
}

// PATCH – mark as sold / unsold (used by your "Mark as sold" button)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const supabase = (await createSupabaseServerClient()) as any;
  const { id } = params;
  const { isSold } = await req.json();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("items")
    .update({ is_sold: !!isSold })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Mark sold error:", error);
    return NextResponse.json(
      { error: "Failed to update sold flag", details: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ item: data }, { status: 200 });
}

// DELETE – delete listing
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const supabase = (await createSupabaseServerClient()) as any;
  const { id } = params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { error: "Delete failed", details: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
