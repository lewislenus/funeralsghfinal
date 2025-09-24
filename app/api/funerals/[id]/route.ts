import { type NextRequest, NextResponse } from "next/server";
import { funeralsAPI } from '@/lib/api/funerals';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { cookies, headers } from 'next/headers';
import { getServiceRoleKey } from './detectEnv';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await funeralsAPI.getFuneral(params.id);

    if (error) {
      return NextResponse.json(
        { error: error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PATCH request received for funeral ID:", params.id);

    if (!params.id) {
      return NextResponse.json({ error: "Missing funeral ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { status, featured, is_visible } = body as { status?: string; featured?: boolean; is_visible?: boolean };

    if (!status && typeof featured !== 'boolean' && typeof is_visible !== 'boolean') {
      return NextResponse.json({ error: "Provide status, featured, or is_visible" }, { status: 400 });
    }

    const updates: { status?: string; featured?: boolean; is_visible?: boolean } = {};
    if (status) {
      const validStatuses = ["draft", "pending", "approved", "rejected", "completed"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = status;
    }
    if (typeof featured === 'boolean') updates.featured = featured;
    if (typeof is_visible === 'boolean') updates.is_visible = is_visible;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = getServiceRoleKey(); // Use our helper function

    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 });
    }

    // Log which key we're using
    console.log("Using service key:", !!serviceKey);

    // Build client (service preferred)
    let client = createClient<Database>(url, serviceKey || anonKey, { 
      auth: { persistSession: false },
      // Add extra options for debugging
      global: {
        fetch: (...args) => {
          // @ts-ignore - we know fetch is available
          return fetch(...args);
        }
      }
    });

    // Accept either UUIDs or numeric IDs (older datasets may use integers)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
    const isNumeric = /^\d+$/.test(params.id);
    const idFilterValue = isNumeric ? (Number(params.id) as any) : params.id;

    console.log("PATCH: Processing funeral ID:", params.id);
    
    let { data, error } = await client
      .from('funerals')
      .update(updates)
  .eq('id', idFilterValue)
      .select('*')
      .maybeSingle();

    // If RLS / permission error without service key, give clearer guidance
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      const permissionLike = msg.includes('permission') || msg.includes('rls');
      const columnError = msg.includes('column') && msg.includes('is_visible');
      
      if (columnError) {
        console.error('Database schema error - is_visible column missing:', error);
        return NextResponse.json({
          error: 'Database schema needs to be updated. Please run the migration script: scripts/add-visibility-column.sql'
        }, { status: 500 });
      }
      
      if (permissionLike && !serviceKey) {
        return NextResponse.json({
          error: 'Permission denied by Row Level Security. Add SUPABASE_SERVICE_ROLE_KEY to .env.local or log in as an admin user whose profile.role = "admin".'
        }, { status: 403 });
      }
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      // Existence check
      const { data: exists, error: existsErr } = await client
        .from('funerals')
        .select('id')
        .eq('id', idFilterValue)
        .maybeSingle();
      if (existsErr) {
        return NextResponse.json({ error: 'Unable to verify update (RLS?)' }, { status: 403 });
      }
      if (!exists) {
        return NextResponse.json({ error: 'Funeral not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Update blocked by RLS. Supply service role key.' }, { status: 403 });
    }

    return NextResponse.json({ data, success: true });
  } catch (e) {
    console.error('Unexpected PATCH error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
