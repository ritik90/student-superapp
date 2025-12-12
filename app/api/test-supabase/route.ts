import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';


export async function GET(req: NextRequest) {
  try {
    // Simple test: ask Supabase who the first user is (if any)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      usersCount: data?.users?.length ?? 0,
    });
  } catch (e: any) {
    console.error('Unexpected error:', e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
