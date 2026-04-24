import { type UserRole } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  CMU_ENTRA_CALLBACK_PATH,
  getCmuEntraConfig,
} from "@/lib/auth/cmu-entra";
import { createSession } from "@/lib/auth/session";
import { getSafePostLoginRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

const STATE_COOKIE_NAME = "cmu_entra_oauth_state";
const NEXT_COOKIE_NAME = "cmu_entra_oauth_next";

type TokenResponse = {
  access_token?: string;
};

type UserinfoResponse = {
  email?: unknown;
  mail?: unknown;
  preferred_username?: unknown;
  userPrincipalName?: unknown;
  upn?: unknown;
  cmuitaccount?: unknown;
  student_email?: unknown;
  studentEmail?: unknown;
  account?: unknown;
  username?: unknown;
};

function splitStudentName(name: string | null) {
  const parts = (name ?? "").split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

function createLoginRedirect(request: NextRequest, code: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("cmu", code);

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
}

function getEmailFromUserinfo(profile: UserinfoResponse) {
  const candidates = [
    profile.email,
    profile.mail,
    profile.preferred_username,
    profile.userPrincipalName,
    profile.upn,
    profile.student_email,
    profile.studentEmail,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim().toLowerCase();
    }
  }

  return null;
}

function getEmailFromBasicInfo(profile: UserinfoResponse) {
  const directEmail = getEmailFromUserinfo(profile);

  if (directEmail) {
    return directEmail;
  }

  const accountCandidates = [
    profile.cmuitaccount,
    profile.account,
    profile.username,
  ];

  for (const candidate of accountCandidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const normalized = candidate.trim().toLowerCase();

    if (!normalized) {
      continue;
    }

    if (normalized.includes("@")) {
      return normalized;
    }

    return `${normalized}@cmu.ac.th`;
  }

  return null;
}

async function exchangeCodeForAccessToken(
  code: string,
  redirectUri: string,
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
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

  return getEmailFromUserinfo(payload);
}

async function getUserEmailFromBasicInfo(basicInfoUrl: string, accessToken: string) {
  const response = await fetch(basicInfoUrl, {
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

  return getEmailFromBasicInfo(payload);
}

export async function GET(request: NextRequest) {
  let config;

  try {
    config = getCmuEntraConfig();
  } catch {
    return NextResponse.redirect(createLoginRedirect(request, "not_configured"));
  }

  const providerError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE_NAME)?.value;
  const nextPath = request.cookies.get(NEXT_COOKIE_NAME)?.value ?? null;

  if (providerError) {
    const response = NextResponse.redirect(
      createLoginRedirect(
        request,
        providerError === "access_denied" ? "access_denied" : "callback_failed",
      ),
    );
    clearStateCookie(response, config.callbackPath || CMU_ENTRA_CALLBACK_PATH);

    return response;
  }

  if (!code || !state || !storedState || storedState !== state) {
    const response = NextResponse.redirect(createLoginRedirect(request, "invalid_state"));
    clearStateCookie(response, config.callbackPath || CMU_ENTRA_CALLBACK_PATH);

    return response;
  }

  const accessToken = await exchangeCodeForAccessToken(
    code,
    config.callbackUrl,
    config.tokenUrl,
    config.clientId,
    config.clientSecret,
  );

  if (!accessToken) {
    const response = NextResponse.redirect(createLoginRedirect(request, "token_failed"));
    clearStateCookie(response, config.callbackPath || CMU_ENTRA_CALLBACK_PATH);

    return response;
  }

  const email = config.basicInfoUrl
    ? await getUserEmailFromBasicInfo(config.basicInfoUrl, accessToken)
    : await getUserEmail(config.userinfoUrl, accessToken);

  if (!email) {
    const response = NextResponse.redirect(createLoginRedirect(request, "userinfo_failed"));
    clearStateCookie(response, config.callbackPath || CMU_ENTRA_CALLBACK_PATH);

    return response;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      studentProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    const response = NextResponse.redirect(createLoginRedirect(request, "email_not_allowed"));
    clearStateCookie(response, config.callbackPath || CMU_ENTRA_CALLBACK_PATH);

    return response;
  }

  if (user.role === "student" && !user.studentProfile) {
    const { firstName, lastName } = splitStudentName(user.name);

    await prisma.student.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
        firstName,
        lastName,
      },
    });
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name ?? null,
  });

  const response = NextResponse.redirect(
    new URL(getSafePostLoginRedirectPath(user.role, nextPath), request.url),
  );
  clearStateCookie(response, config.callbackPath || CMU_ENTRA_CALLBACK_PATH);

  return response;
}