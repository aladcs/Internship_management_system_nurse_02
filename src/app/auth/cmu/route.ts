import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withAppBasePath } from "@/lib/app-paths";
import {
  CMU_ENTRA_CALLBACK_PATH,
  getCmuEntraConfig,
} from "@/lib/auth/cmu-entra";
import { createPkceCodeChallenge, createPkceCodeVerifier } from "@/lib/auth/oauth-pkce";
import { normalizeOAuthNextPath } from "@/lib/auth/oauth-login";

const STATE_COOKIE_NAME = "cmu_entra_oauth_state";
const NEXT_COOKIE_NAME = "cmu_entra_oauth_next";
const PKCE_COOKIE_NAME = "cmu_entra_oauth_pkce_verifier";
const STATE_TTL_SECONDS = 60 * 10;

function createLoginRedirect(request: NextRequest, code: string) {
  const loginUrl = new URL(withAppBasePath("/login"), request.url);
  loginUrl.searchParams.set("cmu", code);

  return loginUrl;
}

export async function GET(request: NextRequest) {
  let config;

  try {
    config = getCmuEntraConfig();
  } catch {
    return NextResponse.redirect(createLoginRedirect(request, "not_configured"));
  }

  const state = randomBytes(24).toString("base64url");
  const codeVerifier = createPkceCodeVerifier();
  const codeChallenge = createPkceCodeChallenge(codeVerifier);
  const nextPath = normalizeOAuthNextPath(request.nextUrl.searchParams.get("next"));
  const authorizationUrl = new URL(config.authorizeUrl);

  authorizationUrl.searchParams.set("client_id", config.clientId);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", config.callbackUrl);
  authorizationUrl.searchParams.set("scope", config.scope);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("response_mode", "query");
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: config.callbackPath || CMU_ENTRA_CALLBACK_PATH,
    maxAge: STATE_TTL_SECONDS,
  });

  response.cookies.set(NEXT_COOKIE_NAME, nextPath ?? "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: config.callbackPath || CMU_ENTRA_CALLBACK_PATH,
    maxAge: STATE_TTL_SECONDS,
  });

  response.cookies.set(PKCE_COOKIE_NAME, codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: config.callbackPath || CMU_ENTRA_CALLBACK_PATH,
    maxAge: STATE_TTL_SECONDS,
  });

  return response;
}
