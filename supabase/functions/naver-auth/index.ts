// Naver Login → Supabase session bridge.
//
// Supabase Auth doesn't support Naver as a built-in OAuth provider (unlike
// Google/Kakao), so this Edge Function does the work Supabase's own OAuth
// handling does for those providers: it's registered as the Naver "콜백 URL"
// (redirect_uri), so Naver sends the browser here after consent. From here we:
//   1. Exchange the authorization code for a Naver access token (using our
//      NAVER_CLIENT_SECRET — this must stay server-side, never in the app).
//   2. Fetch the user's Naver profile.
//   3. Find or create a matching Supabase auth user (via the service-role
//      Admin API) and mint a one-time magic-link token for them.
//   4. Redirect the browser back to the app with that token in the URL.
//      App.tsx picks it up and calls supabase.auth.verifyOtp() to turn it
//      into a real signed-in session — after that everything (RLS, auth.uid(),
//      onboarding) works exactly like a Google/Kakao login.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const NAVER_CLIENT_ID = Deno.env.get("NAVER_CLIENT_ID") ?? "";
const NAVER_CLIENT_SECRET = Deno.env.get("NAVER_CLIENT_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
// Where to send the browser back to once login succeeds/fails. Can be
// overridden per-environment via the APP_ORIGIN secret; defaults to the
// production Vercel deployment.
const APP_ORIGIN = Deno.env.get("APP_ORIGIN") ?? "https://peteed-app-web.vercel.app";

function backToApp(params: Record<string, string | null | undefined>) {
  const url = new URL(APP_ORIGIN);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return Response.redirect(url.toString(), 302);
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const naverError = url.searchParams.get("error");

  if (naverError) {
    return backToApp({ naver_error: "네이버 로그인이 취소됐어요", state });
  }
  if (!code) {
    return backToApp({ naver_error: "인증 코드가 전달되지 않았어요", state });
  }
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error("NAVER_CLIENT_ID / NAVER_CLIENT_SECRET secret not set");
    return backToApp({ naver_error: "네이버 로그인이 아직 설정되지 않았어요", state });
  }

  try {
    // 1) Exchange the authorization code for a Naver access token.
    const tokenUrl = new URL("https://nid.naver.com/oauth2.0/token");
    tokenUrl.searchParams.set("grant_type", "authorization_code");
    tokenUrl.searchParams.set("client_id", NAVER_CLIENT_ID);
    tokenUrl.searchParams.set("client_secret", NAVER_CLIENT_SECRET);
    tokenUrl.searchParams.set("code", code);
    if (state) tokenUrl.searchParams.set("state", state);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();
    if (!tokenData?.access_token) {
      console.error("Naver token exchange failed:", tokenData);
      return backToApp({ naver_error: "네이버 인증에 실패했어요", state });
    }

    // 2) Fetch the Naver profile with that access token.
    const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileRes.json();
    const p = profileData?.response;
    if (!p?.id) {
      console.error("Naver profile fetch failed:", profileData);
      return backToApp({ naver_error: "네이버 프로필을 가져오지 못했어요", state });
    }

    const naverId: string = p.id;
    const naverEmail: string | undefined = p.email;
    const name: string = p.name ?? p.nickname ?? "네이버 사용자";
    // Email consent is optional on Naver's side — fall back to a stable
    // synthetic address keyed on the Naver user id so the same person always
    // maps to the same Supabase account even without a real email.
    const effectiveEmail = naverEmail && naverEmail.includes("@")
      ? naverEmail
      : `naver_${naverId}@users.peteed.app`;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3) Find the matching Supabase user, or create one.
    // NOTE: the Admin API has no "get user by email" lookup, so this scans
    // pages of users — fine at PETEED's current scale; worth revisiting
    // (e.g. a naver_id lookup table) if the user base grows into the
    // thousands.
    let user: { id: string; email?: string } | undefined;
    let page = 1;
    while (!user) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) {
        console.error("listUsers failed:", error);
        break;
      }
      user = data.users.find(
        (u) => u.email === effectiveEmail || u.user_metadata?.naver_id === naverId
      );
      if (user || data.users.length < 1000) break;
      page += 1;
    }

    if (!user) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: effectiveEmail,
        email_confirm: true,
        user_metadata: {
          naver_id: naverId,
          full_name: name,
          avatar_url: p.profile_image ?? null,
          provider: "naver",
        },
        app_metadata: { provider: "naver", providers: ["naver"] },
      });
      if (createErr || !created?.user) {
        console.error("createUser failed:", createErr);
        return backToApp({ naver_error: "회원 정보를 만들지 못했어요", state });
      }
      user = created.user;
    }

    // 4) Mint a one-time magic-link token the client can redeem for a session.
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: user.email!,
    });
    const hashedToken = linkData?.properties?.hashed_token;
    if (linkErr || !hashedToken) {
      console.error("generateLink failed:", linkErr);
      return backToApp({ naver_error: "로그인 토큰을 만들지 못했어요", state });
    }

    return backToApp({ naver_token: hashedToken, state });
  } catch (err) {
    console.error("Naver auth exception:", err);
    return backToApp({ naver_error: "네이버 로그인 중 오류가 발생했어요", state });
  }
});
