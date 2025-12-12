// app/chats/[id]/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ChatClient from "./ChatClient";

type PageProps = {
  // In Next 16, params is a Promise in server components
  params: Promise<{ id: string }>;
};

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  // Ensure user is logged in
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?reason=login_required");
  }

  const currentUserId = authData.user.id;

  // Load conversation + linked item
  const { data: convo, error } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, item_id, items(*)")
    .eq("id", id)
    .single();

  if (error || !convo) {
    console.error("Conversation not found:", error);
    redirect("/chats");
  }

  // Make sure this user is part of the conversation
  if (
    convo.buyer_id !== currentUserId &&
    convo.seller_id !== currentUserId
  ) {
    redirect("/chats");
  }

  const item = (convo as any).items || null;

  const itemId: string =
    (item && item.id) || (convo.item_id as string | undefined) || id;

  const itemTitle: string = item?.title ?? "Listing";
  const itemImage: string | null =
    Array.isArray(item?.image_urls) && item.image_urls.length > 0
      ? item.image_urls[0]
      : null;

  const itemPrice: number | null =
    typeof item?.price_eur === "number" ? item.price_eur : null;

  const itemLocation: string | null = item?.location ?? null;

  // figure out labels for chat participants
  const itemOwnerId: string | null = item?.user_id ?? null;
  const sellerEmail: string | null = item?.seller_email ?? null;

  // otherDisplayName:
  // - if current user is the seller -> label other as "Buyer"
  // - else, if we know seller email -> show that (good identifier)
  // - else fallback to "Other student"
  let otherDisplayName = "Other student";
  let otherRole = "Student";

  if (currentUserId === itemOwnerId) {
    otherDisplayName = "Buyer";
    otherRole = "Buyer";
  } else if (sellerEmail) {
    otherDisplayName = sellerEmail;
    otherRole = "Seller";
  } else {
    otherDisplayName = "Seller";
    otherRole = "Seller";
  }

  const selfDisplayName = "You";

  return (
    <ChatClient
      conversationId={id}
      currentUserId={currentUserId}
      itemId={itemId}
      itemTitle={itemTitle}
      itemImage={itemImage}
      itemPrice={itemPrice}
      itemLocation={itemLocation}
      selfDisplayName={selfDisplayName}
      otherDisplayName={otherDisplayName}
      otherRole={otherRole}
    />
  );
}
