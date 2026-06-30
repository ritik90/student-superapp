// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type ConversationRow = {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
};

async function getAuthedUserAndSupabase() {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return { supabase, userId: null as string | null };
  }

  return { supabase, userId: authData.user.id as string };
}

async function assertUserInConversation(
  supabase: any,
  conversationId: string,
  userId: string
): Promise<{ ok: boolean; response?: NextResponse }> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id,buyer_id,seller_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !data) {
    console.error("Conversation lookup error:", error);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      ),
    };
  }

  const convo = data as ConversationRow;
  const isParticipant =
    convo.buyer_id === userId || convo.seller_id === userId;

  if (!isParticipant) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "You are not part of this conversation" },
        { status: 403 }
      ),
    };
  }

  return { ok: true };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId" },
        { status: 400 }
      );
    }

    const { supabase, userId } = await getAuthedUserAndSupabase();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Only participants can see messages
    const check = await assertUserInConversation(
      supabase,
      conversationId,
      userId
    );
    if (!check.ok && check.response) return check.response;

    const { data, error } = await supabase
      .from("messages")
      .select("id,conversation_id,sender_id,content,created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("GET /api/messages error:", error);
      return NextResponse.json(
        { error: "Failed to load messages" },
        { status: 500 }
      );
    }

    // Viewing a conversation marks it as read, for this user only.
    const { error: readError } = await supabase
      .from("conversation_reads")
      .upsert(
        {
          conversation_id: conversationId,
          user_id: userId,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "conversation_id,user_id" }
      );

    if (readError) {
      console.error("Failed to update read state:", readError);
    }

    return NextResponse.json({
      messages: data ?? [],
      userId,
    });
  } catch (err) {
    console.error("GET /api/messages unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, userId } = await getAuthedUserAndSupabase();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const conversationId = (body.conversationId as string | undefined) ?? "";
    const content = (body.content as string | undefined)?.trim() ?? "";

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "Missing conversationId or content" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // Basic abuse protection: max 10 messages per 10 seconds per user.
    // Checked against the database (not in-memory) because Vercel's
    // serverless functions don't share memory between invocations.
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString();
    const { count: recentCount, error: rateError } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", userId)
      .gte("created_at", tenSecondsAgo);

    if (rateError) {
      console.error("Rate limit check failed:", rateError);
    } else if ((recentCount ?? 0) >= 10) {
      return NextResponse.json(
        { error: "You're sending messages too fast. Please wait a moment." },
        { status: 429 }
      );
    }

    // Only participants can send
    const check = await assertUserInConversation(
      supabase,
      conversationId,
      userId
    );
    if (!check.ok && check.response) return check.response;

    const { data: msg, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content,
      })
      .select("id,created_at")
      .single();

    if (error || !msg) {
      console.error("Insert message error:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    // Update conversation metadata, including who sent it, so unread
    // tracking never flags your own latest message as unread for you.
    await supabase
      .from("conversations")
      .update({
        last_message_at: msg.created_at,
        last_message_preview: content.slice(0, 120),
        last_message_sender_id: userId,
      })
      .eq("id", conversationId);

    // Sending a message also counts as having read up to this point.
    await supabase.from("conversation_reads").upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
        last_read_at: msg.created_at,
      },
      { onConflict: "conversation_id,user_id" }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/messages unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
