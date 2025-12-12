// app/api/chats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const currentUserId = authData.user.id;

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        item_id,
        buyer_id,
        seller_id,
        last_message_at,
        last_message_preview,
        items (
          title,
          image_urls
        )
      `
      )
      .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to load conversations" },
        { status: 500 }
      );
    }

    const convs = data ?? [];

    // --- get other user ids for each conversation ---
    const otherIds = Array.from(
      new Set(
        convs
          .map((c) =>
            c.buyer_id === currentUserId ? c.seller_id : c.buyer_id
          )
          .filter((id) => !!id) as string[]
      )
    );

    // fetch each user's name/email via admin client
    const userMap = new Map<
      string,
      { full_name: string | null; email: string | null }
    >();

    for (const uid of otherIds) {
      try {
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(uid);
        if (!userError && userData?.user) {
          const meta = (userData.user.user_metadata || {}) as any;
          userMap.set(uid, {
            full_name: (meta.full_name as string) ?? null,
            email: userData.user.email ?? null,
          });
        }
      } catch (e) {
        console.error("Error loading user for conversation:", uid, e);
      }
    }

    const enriched = convs.map((c) => {
      const otherId =
        c.buyer_id === currentUserId ? c.seller_id : c.buyer_id;
      const info = otherId ? userMap.get(otherId) : undefined;

      return {
        ...c,
        other_user_name: info?.full_name || info?.email || "Student",
        other_user_email: info?.email ?? null,
      };
    });

    return NextResponse.json({ conversations: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const itemId = body.itemId as string | undefined;
    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, user_id, title")
      .eq("id", itemId)
      .single();

    if (itemError || !item) {
      console.error(itemError);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const buyerId = authData.user.id;
    const sellerId = item.user_id;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("item_id", itemId)
      .eq("buyer_id", buyerId)
      .eq("seller_id", sellerId)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ conversationId: existing.id });
    }

    const { data: convo, error: insertError } = await supabase
      .from("conversations")
      .insert({
        item_id: itemId,
        buyer_id: buyerId,
        seller_id: sellerId,
        last_message_at: new Date().toISOString(),
        last_message_preview: `New conversation about "${item.title}"`,
      })
      .select("id")
      .single();

    if (insertError || !convo) {
      console.error(insertError);
      return NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversationId: convo.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
