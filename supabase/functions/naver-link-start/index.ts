// Step 1 of "connect my Naver account" from My Page (an already-logged-in
// user, via Google/Kakao/email). Unlike a normal Naver login, we don't want
// to hand back a *new* session — we want to attach the Naver identity to the
// user who's already signed in.
//
// Supabase's own `linkIdentity()` only works for its native OAuth providers
// (Google/Kakao), so for Naver we roll our own two-step "ticket" handshake:
//   1. (this function) the signed-in client calls us with their access
//      token. We verify it, mint a short-lived ticket row keyed to their
//      user id, and hand back the ticket id.
//   2. The client uses that ticket id as the Naver OAuth `state` param
//      instead of a random CSRF token. When Naver redirects back to
//      naver-auth, it recognizes `state` as a live ticket and links the
//      Naver account to ticket.user_id instead of starting a fresh login.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "로그인이 필요해요" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    console.error("naver-link-start: invalid session:", userErr);
    return json({ error: "로그인 정보가 유효하지 않아요" }, 401);
  }

  const { data: ticket, error: insertErr } = await admin
    .from("oauth_link_tickets")
    .insert({ user_id: userData.user.id, provider: "naver" })
    .select("id")
    .single();

  if (insertErr || !ticket) {
    console.error("naver-link-start: ticket insert failed:", insertErr);
    return json({ error: "연결 준비에 실패했어요" }, 500);
  }

  return json({ ticket: ticket.id });
});
