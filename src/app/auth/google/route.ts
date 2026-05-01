import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withAppBasePath } from "@/lib/app-paths";
import {
  GOOGLE_OAUTH_CALLBACK_PATH,
  getGoogleOAuthConfig,
} from "@/lib/auth/google-oauth";
import { normalizeOAuthNextPath } from "@/lib/auth/oauth-login";

const STATE_COOKIE_NAME = "google_oauth_state";
const NEXT_COOKIE_NAME = "google_oauth_next";
const STATE_TTL_SECONDS = 60 * 10;

function createLoginRedirect(request: NextRequest, code: string) {
  const loginUrl = new URL(withAppBasePath("/login"), request.url);
  loginUrl.searchParams.set("google", code);

  return loginUrl;
}

export async function GET(request: NextRequest) {
  let config;

  try {
    config = getGoogleOAuthConfig();
  } catch {
    return NextResponse.redirect(createLoginRedirect(request, "not_configured"));
  }

  const state = randomBytes(24).toString("base64url");
  const nextPath = normalizeOAuthNextPath(request.nextUrl.searchParams.get("next"));
  const authorizationUrl = new URL(config.authorizeUrl);

  authorizationUrl.searchParams.set("client_id", config.clientId);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", config.callbackUrl);
  authorizationUrl.searchParams.set("scope", config.scope);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("access_type", "online");
  authorizationUrl.searchParams.set("include_granted_scopes", "true");
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: config.callbackPath || GOOGLE_OAUTH_CALLBACK_PATH,
    maxAge: STATE_TTL_SECONDS,
  });

  response.cookies.set(NEXT_COOKIE_NAME, nextPath ?? "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: config.callbackPath || GOOGLE_OAUTH_CALLBACK_PATH,
    maxAge: STATE_TTL_SECONDS,
  });

  return response;
}