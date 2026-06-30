// app/api/chats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type OtherUserInfo = { full_name: string | null; email: string | null };

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
        last_message_sender_id,
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

    const userEntries: Array<[string, OtherUserInfo]> = [];

    if (otherIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", otherIds);

      if (profilesError) {
        console.error("Error loading profiles for conversations:", profilesError);
      } else {
        for (const p of profiles ?? []) {
          userEntries.push([p.id, { full_name: p.full_name ?? null, email: p.email ?? null }]);
        }
      }
    }

    const userMap = new Map(userEntries);

    // --- read state, batched in one query ---
    const readMap = new Map<string, string>(); // conversation_id -> last_read_at

    if (convs.length > 0) {
      const { data: reads, error: readsError } = await supabase
        .from("conversation_reads")
        .select("conversation_id, last_read_at")
        .eq("user_id", currentUserId)
        .in("conversation_id", convs.map((c) => c.id));

      if (readsError) {
        console.error("Error loading read state:", readsError);
      } else {
        for (const r of reads ?? []) {
          readMap.set(r.conversation_id, r.last_read_at);
        }
      }
    }

    const enriched = convs.map((c) => {
      const otherId =
        c.buyer_id === currentUserId ? c.seller_id : c.buyer_id;
      const info = otherId ? userMap.get(otherId) : undefined;

      const lastSenderIsOther =
        !!c.last_message_sender_id && c.last_message_sender_id !== currentUserId;
      const myReadAt = readMap.get(c.id);

      const isUnread = Boolean(
        c.last_message_at &&
          lastSenderIsOther &&
          (!myReadAt ||
            new Date(c.last_message_at).getTime() >
              new Date(myReadAt).getTime())
      );

      return {
        ...c,
        other_user_name: info?.full_name || info?.email || "Student",
        other_user_email: info?.email ?? null,
        is_unread: isUnread,
      };
    });

    const unreadCount = enriched.filter((c) => c.is_unread).length;

    return NextResponse.json({ conversations: enriched, unread_count: unreadCount });
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
