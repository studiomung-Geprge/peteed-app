// Disconnects Naver from the caller's account (My Page → "네이버 연결 해제").
//
// Naver isn't tracked as a real Supabase `auth.identities` row (it's just
// metadata we set ourselves — see naver-auth/naver-link-start), so
// Supabase's own "must keep at least one identity" safety check for
// unlinkIdentity() never sees it and can't protect us here. We do that
// check ourselves: refuse to unlink if Naver is the caller's *only* way to
// sign back in (no email/Google/Kakao identity on the account).
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
    console.error("naver-unlink: invalid session:", userErr);
    return json({ error: "로그인 정보가 유효하지 않아요" }, 401);
  }
  const user = userData.user;

  if (!user.user_metadata?.naver_id) {
    return json({ error: "연결된 네이버 계정이 없어요" }, 400);
  }

  // Native identities (email/password, Google, Kakao) are real
  // `auth.identities` rows — Naver deliberately isn't one (see naver-auth),
  // so this count already excludes it.
  const nativeIdentityCount = user.identities?.length ?? 0;
  if (nativeIdentityCount === 0) {
    return json({ error: "네이버 연결을 해제하면 로그인할 방법이 없어져요. 먼저 다른 로그인 수단을 연결해 주세요." }, 400);
  }

  const existingProviders: string[] = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];
  const remainingProviders = existingProviders.filter((p) => p !== "naver");
  // If Naver was the most-recently-used ("last login wins") provider, fall
  // back to whatever's left so the dashboard doesn't keep showing a
  // disconnected provider as current.
  const nextProvider = user.app_metadata?.provider === "naver"
    ? (remainingProviders[0] ?? user.app_metadata?.provider ?? "email")
    : user.app_metadata?.provider;

  const { naver_id: _naverId, ...restUserMetadata } = user.user_metadata ?? {};

  const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      provider: nextProvider,
      providers: remainingProviders,
    },
    user_metadata: restUserMetadata,
  });

  if (updateErr) {
    console.error("naver-unlink: updateUserById failed:", updateErr);
    return json({ error: "연결 해제에 실패했어요" }, 500);
  }

  return json({ ok: true });
});
