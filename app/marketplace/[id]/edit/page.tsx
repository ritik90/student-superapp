// app/marketplace/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import EditListingForm from "./EditListingForm";

type PageProps = {
  // Next 16 passes params as a Promise
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;

  // Use admin client just to read the item (ignores RLS).
  const { data: item, error } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !item) {
    // If item doesn’t exist → 404
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Edit listing</h1>
        <EditListingForm initialItem={item} />
      </div>
    </div>
  );
}
