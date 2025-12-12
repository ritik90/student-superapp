// app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_PRICE_EUR = 100000;
const MAX_IMAGES = 6;

// 👇 EXACTLY matches your form + filters (lowercase values)
const ALLOWED_CATEGORIES = [
  "furniture",
  "electronics",
  "books",
  "kitchen",
  "appliances",
  "tickets",
  "stationery",
  "sports",
  "gaming",
  "other",
];

const ALLOWED_CONDITIONS = [
  "new",
  "kind of new",
  "used",
  "well used",
];

const ALLOWED_LOCATIONS = [
  "Dublin 1",
  "Dublin 2",
  "Dublin 4",
  "Dublin 6",
  "Dublin 8",
  "On-campus TCD",
  "On-campus UCD",
  "On-campus DCU",
  "NCIRL",
  "Online only",
];

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/items error:", error);
      return NextResponse.json(
        { error: "Failed to load items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    console.error("GET /api/items unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    let {
      title,
      price_eur,
      category,
      location,
      condition,
      description,
      phone,
      image_urls,
    } = body as {
      title?: unknown;
      price_eur?: unknown;
      category?: unknown;
      location?: unknown;
      condition?: unknown;
      description?: unknown;
      phone?: unknown;
      image_urls?: unknown;
    };

    // ---------- NORMALISE ----------
    const cleanTitle =
      typeof title === "string" ? title.trim() : "";
    const cleanDescription =
      typeof description === "string" ? description.trim() : null;
    const cleanCategory =
      typeof category === "string" ? category : "";
    const cleanLocation =
      typeof location === "string" ? location : "";
    const cleanCondition =
      typeof condition === "string" ? condition : "used";

    const priceNumber =
      typeof price_eur === "number"
        ? price_eur
        : Number(price_eur);

    const imagesArray: string[] = Array.isArray(image_urls)
      ? image_urls.filter((u) => typeof u === "string")
      : [];

    // phone optional, any text (trim + cap length)
    let phoneToStore: string | null = null;
    if (typeof phone === "string") {
      const trimmedPhone = phone.trim();
      if (trimmedPhone.length > 0) {
        phoneToStore = trimmedPhone.slice(0, 50);
      }
    }
    // -------------------------------

    // ---------- VALIDATION ----------
    if (!cleanTitle) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (cleanTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        {
          error: `Title is too long (max ${MAX_TITLE_LENGTH} characters)`,
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(priceNumber) ||
      priceNumber <= 0 ||
      priceNumber > MAX_PRICE_EUR
    ) {
      return NextResponse.json(
        { error: "Price must be a positive number in euro" },
        { status: 400 }
      );
    }

    if (!cleanCategory || !ALLOWED_CATEGORIES.includes(cleanCategory)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    if (!cleanCondition || !ALLOWED_CONDITIONS.includes(cleanCondition)) {
      return NextResponse.json(
        { error: "Invalid condition" },
        { status: 400 }
      );
    }

    if (!cleanLocation || !ALLOWED_LOCATIONS.includes(cleanLocation)) {
      return NextResponse.json(
        { error: "Invalid location" },
        { status: 400 }
      );
    }

    if (
      cleanDescription &&
      cleanDescription.length > MAX_DESCRIPTION_LENGTH
    ) {
      return NextResponse.json(
        {
          error: `Description is too long (max ${MAX_DESCRIPTION_LENGTH} characters)`,
        },
        { status: 400 }
      );
    }

    if (imagesArray.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          error: `Too many images. Max ${MAX_IMAGES} images allowed.`,
        },
        { status: 400 }
      );
    }

    const cleanImages = imagesArray.filter((url) => {
      return (
        typeof url === "string" &&
        url.length > 0 &&
        (url.startsWith("http://") || url.startsWith("https://"))
      );
    });
    // -------------------------------

    const email = user.email ?? "";
    const collegeDomain = email.includes("@")
      ? email.split("@")[1]?.toLowerCase() ?? null
      : null;

    const { data, error } = await supabase
      .from("items")
      .insert({
        title: cleanTitle,
        price_eur: priceNumber,
        category: cleanCategory,
        location: cleanLocation,
        condition: cleanCondition,
        description: cleanDescription,
        phone: phoneToStore,
        image_urls: cleanImages,
        user_id: user.id,
        is_sold: false,
        college_domain: collegeDomain,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Insert item error:", error);
      return NextResponse.json(
        { error: "Failed to create item" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, id: data?.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/items unexpected error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
