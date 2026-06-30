// app/api/messages/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = authData.user.id;
    const body = await req.json();
    const conversationId = body.conversationId as string | undefined;

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .select("id,buyer_id,seller_id")
      .eq("id", conversationId)
      .maybeSingle();

    if (convoError || !convo) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant = convo.buyer_id === userId || convo.seller_id === userId;
    if (!isParticipant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const { error: upsertError } = await supabase.from("conversation_reads").upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "conversation_id,user_id" }
    );

    if (upsertError) {
      console.error("Failed to mark conversation as read:", upsertError);
      return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/messages/read unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
