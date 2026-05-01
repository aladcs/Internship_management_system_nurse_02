import { withAppBasePath } from "@/lib/app-paths";

const DEFAULT_SCOPE = "openid email profile";

export const GOOGLE_OAUTH_LOGIN_PATH = "/auth/google";
export const GOOGLE_OAUTH_CALLBACK_PATH = "/auth/google/callback";

type RequiredEnvName =
  | "APP_BASE_URL"
  | "GOOGLE_OAUTH_CLIENT_ID"
  | "GOOGLE_OAUTH_CLIENT_SECRET";

export type GoogleOAuthConfig = {
  appBaseUrl: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  callbackPath: string;
  callbackUrl: string;
  scope: string;
};

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizePath(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

function resolveCallbackConfig(appBaseUrl: string, value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return {
      callbackPath: withAppBasePath(GOOGLE_OAUTH_CALLBACK_PATH),
      callbackUrl: `${appBaseUrl}${withAppBasePath(GOOGLE_OAUTH_CALLBACK_PATH)}`,
    };
  }

  if (normalizedValue.startsWith("http://") || normalizedValue.startsWith("https://")) {
    const callbackUrl = new URL(normalizedValue);

    return {
      callbackPath: callbackUrl.pathname,
      callbackUrl: callbackUrl.toString(),
    };
  }

  const callbackPath = normalizePath(normalizedValue);
  const externalCallbackPath = withAppBasePath(callbackPath);

  return {
    callbackPath: externalCallbackPath,
    callbackUrl: `${appBaseUrl}${externalCallbackPath}`,
  };
}

function readRequiredEnv(name: RequiredEnvName) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required for Google OAuth login.`);
  }

  return value;
}

function getOptionalEndpoint(name: "GOOGLE_OAUTH_AUTHORIZE_URL" | "GOOGLE_OAUTH_TOKEN_URL" | "GOOGLE_OAUTH_USERINFO_URL") {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

export function isGoogleOAuthConfigured() {
  return Boolean(
    process.env.APP_BASE_URL?.trim() &&
      process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim(),
  );
}

export function getGoogleOAuthConfig(): GoogleOAuthConfig {
  const appBaseUrl = normalizeBaseUrl(readRequiredEnv("APP_BASE_URL"));
  const clientId = readRequiredEnv("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = readRequiredEnv("GOOGLE_OAUTH_CLIENT_SECRET");
  const { callbackPath, callbackUrl } = resolveCallbackConfig(
    appBaseUrl,
    process.env.GOOGLE_OAUTH_CALLBACK_PATH,
  );
  const authorizeUrl =
    getOptionalEndpoint("GOOGLE_OAUTH_AUTHORIZE_URL") ||
    "https://accounts.google.com/o/oauth2/v2/auth";
  const tokenUrl =
    getOptionalEndpoint("GOOGLE_OAUTH_TOKEN_URL") ||
    "https://oauth2.googleapis.com/token";
  const userinfoUrl =
    getOptionalEndpoint("GOOGLE_OAUTH_USERINFO_URL") ||
    "https://openidconnect.googleapis.com/v1/userinfo";
  const scope = process.env.GOOGLE_OAUTH_SCOPE?.trim() || DEFAULT_SCOPE;

  return {
    appBaseUrl,
    clientId,
    clientSecret,
    authorizeUrl,
    tokenUrl,
    userinfoUrl,
    callbackPath,
    callbackUrl,
    scope,
  };
}