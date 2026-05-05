import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withAppBasePath } from "@/lib/app-paths";
import {
  GOOGLE_OAUTH_CALLBACK_PATH,
  getGoogleOAuthConfig,
} from "@/lib/auth/google-oauth";
import { normalizeOAuthNextPath, signInOAuthUser } from "@/lib/auth/oauth-login";

const STATE_COOKIE_NAME = "google_oauth_state";
const NEXT_COOKIE_NAME = "google_oauth_next";
const PKCE_COOKIE_NAME = "google_oauth_pkce_verifier";

type TokenResponse = {
  access_token?: string;
};

type UserinfoResponse = {
  email?: unknown;
  verified_email?: unknown;
};

function createLoginRedirect(request: NextRequest, code: string) {
  const loginUrl = new URL(withAppBasePath("/login"), request.url);
  loginUrl.searchParams.set("google", code);

  return loginUrl;
}

function clearStateCookie(response: NextResponse, path: string) {
  response.cookies.set(STATE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path,
    expires: new Date(0),
  });

  response.cookies.set(NEXT_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path,
    expires: new Date(0),
  });

  response.cookies.set(PKCE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path,
    expires: new Date(0),
  });
}

async function exchangeCodeForAccessToken(
  code: string,
  redirectUri: string,
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
  codeVerifier: string,
) {
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: codeVerifier,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as TokenResponse;

  return payload.access_token ?? null;
}

async function getUserEmail(userinfoUrl: string, accessToken: string) {
  const response = await fetch(userinfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as UserinfoResponse;

  if (payload.verified_email === false) {
    return null;
  }

  if (typeof payload.email !== "string" || !payload.email.trim()) {
    return null;
  }

  return payload.email.trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  let config;

  try {
    config = getGoogleOAuthConfig();
  } catch {
    return NextResponse.redirect(createLoginRedirect(request, "not_configured"));
  }

  const providerError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE_NAME)?.value;
  const codeVerifier = request.cookies.get(PKCE_COOKIE_NAME)?.value;
  const nextPath = normalizeOAuthNextPath(
    request.cookies.get(NEXT_COOKIE_NAME)?.value ?? null,
  );

  if (providerError) {
    const response = NextResponse.redirect(
      createLoginRedirect(
        request,
        providerError === "access_denied" ? "access_denied" : "callback_failed",
      ),
    );
    clearStateCookie(response, config.callbackPath || GOOGLE_OAUTH_CALLBACK_PATH);

    return response;
  }

  if (!code || !state || !storedState || storedState !== state || !codeVerifier) {
    const response = NextResponse.redirect(createLoginRedirect(request, "invalid_state"));
    clearStateCookie(response, config.callbackPath || GOOGLE_OAUTH_CALLBACK_PATH);

    return response;
  }

  const accessToken = await exchangeCodeForAccessToken(
    code,
    config.callbackUrl,
    config.tokenUrl,
    config.clientId,
    config.clientSecret,
    codeVerifier,
  );

  if (!accessToken) {
    const response = NextResponse.redirect(createLoginRedirect(request, "token_failed"));
    clearStateCookie(response, config.callbackPath || GOOGLE_OAUTH_CALLBACK_PATH);

    return response;
  }

  const email = await getUserEmail(config.userinfoUrl, accessToken);

  if (!email) {
    const response = NextResponse.redirect(createLoginRedirect(request, "userinfo_failed"));
    clearStateCookie(response, config.callbackPath || GOOGLE_OAUTH_CALLBACK_PATH);

    return response;
  }

  const result = await signInOAuthUser({
    email,
    nextPath,
  });

  if (!result.ok) {
    const response = NextResponse.redirect(
      createLoginRedirect(request, result.errorCode),
    );
    clearStateCookie(response, config.callbackPath || GOOGLE_OAUTH_CALLBACK_PATH);

    return response;
  }

  const response = NextResponse.redirect(new URL(result.redirectPath, request.url));
  clearStateCookie(response, config.callbackPath || GOOGLE_OAUTH_CALLBACK_PATH);

  return response;
}
