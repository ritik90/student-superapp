// app/marketplace/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import MarketplaceClient from "./MarketplaceClient";

export default async function MarketplacePage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?reason=login_required");
  }

  return <MarketplaceClient />;
}
