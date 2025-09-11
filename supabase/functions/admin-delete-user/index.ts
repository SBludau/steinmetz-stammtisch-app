// supabase/functions/admin-delete-user/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // ENV (neue Namen + Fallbacks)
  const PROJECT_URL  = Deno.env.get("PROJECT_URL")        ?? Deno.env.get("SUPABASE_URL");
  const ANON_KEY     = Deno.env.get("ANON_KEY")           ?? Deno.env.get("SUPABASE_ANON_KEY");
  const SERVICE_ROLE = Deno.env.get("SERVICE_ROLE_KEY")   ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!PROJECT_URL || !ANON_KEY || !SERVICE_ROLE) {
    return json({ error: "missing env: PROJECT_URL/ANON_KEY/SERVICE_ROLE_KEY" }, 500);
  }

  // Body
  let payload: { user_id?: string; delete_profile?: boolean; delete_storage?: boolean };
  try { payload = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const userId = payload.user_id?.trim();
  const deleteProfile = !!payload.delete_profile;
  const deleteStorage = !!payload.delete_storage;
  if (!userId) return json({ error: "user_id_required" }, 400);

  // Auth Header (Admin JWT)
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "missing_bearer_token" }, 401);

  // Clients
  const caller = createClient(PROJECT_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const admin  = createClient(PROJECT_URL, SERVICE_ROLE);

  // 1) Caller identifizieren
  const { data: callerAuth, error: callerErr } = await caller.auth.getUser();
  if (callerErr || !callerAuth?.user) return json({ error: "unauthenticated" }, 401);
  const callerId = callerAuth.user.id;

  // 2) Rollenprüfung (Service-Client liest, RLS-sicher)
  const { data: callerProfile, error: roleErr } = await admin
    .from("profiles")
    .select("role")
    .eq("auth_user_id", callerId)
    .maybeSingle();
  if (roleErr) return json({ error: "role_check_failed", details: roleErr.message }, 500);
  if (!callerProfile || callerProfile.role !== "admin") return json({ error: "forbidden: admin_only" }, 403);

  // 3) Optional: Ziel-Profil holen (falls verknüpft)
  const { data: targetProfile } = await admin
    .from("profiles")
    .select("id, auth_user_id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  // 4) Optional: Avatare löschen
  let storageRemoved: string[] = [];
  if (deleteStorage) {
    try {
      const folder = userId;
      const { data: items } = await admin.storage.from("avatars").list(folder, { limit: 100 });
      if (items?.length) {
        const paths = items.map((it) => `${folder}/${it.name}`);
        const { error: rmErr } = await admin.storage.from("avatars").remove(paths);
        if (!rmErr) storageRemoved = paths;
      }
    } catch { /* weich ignorieren */ }
  }

  // 5) Profil-Operationen: **mit caller.rpc(...)** aufrufen,
  //    damit public.is_admin() ein gültiges auth.uid() sieht.
  let profileAction: "deleted" | "unlinked" | "none" = "none";
  if (targetProfile?.id) {
    if (deleteProfile) {
      const { error: rpcErr } = await caller.rpc("admin_delete_profile", { p_profile_id: targetProfile.id });
      if (rpcErr) return json({ error: "profile_delete_failed", details: rpcErr.message }, 500);
      profileAction = "deleted";
    } else {
      const { error: rpcErr } = await caller.rpc("admin_unlink_profile", { p_profile_id: targetProfile.id });
      if (rpcErr) return json({ error: "profile_unlink_failed", details: rpcErr.message }, 500);
      profileAction = "unlinked";
    }
  }

  // 6) auth.users löschen (Service-Client)
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) return json({ error: "auth_user_delete_failed", details: delErr.message }, 500);

  return json({
    ok: true,
    deleted_auth_user: userId,
    profile_action: profileAction,
    storage_removed: storageRemoved,
  });
});
