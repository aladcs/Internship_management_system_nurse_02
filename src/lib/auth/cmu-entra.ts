const DEFAULT_SCOPE = "openid profile email";

export const CMU_ENTRA_LOGIN_PATH = "/intern/auth/cmu";
export const CMU_ENTRA_CALLBACK_PATH = "/intern/api/auth/callback";

type RequiredEnvName =
  | "APP_BASE_URL"
  | "CMU_ENTRA_TENANT_ID"
  | "CMU_ENTRA_CLIENT_ID"
  | "CMU_ENTRA_CLIENT_SECRET";

export type CmuEntraConfig = {
  appBaseUrl: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  basicInfoUrl: string | null;
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

function readRequiredEnv(name: RequiredEnvName) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required for CMU Entra login.`);
  }

  return value;
}

function getOptionalEndpoint(name: "CMU_ENTRA_AUTHORIZE_URL" | "CMU_ENTRA_TOKEN_URL" | "CMU_ENTRA_USERINFO_URL") {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

function getOptionalBasicInfoUrl() {
  const value = process.env.CMU_ENTRA_BASICINFO_URL?.trim();

  return value ? value : null;
}

export function isCmuEntraConfigured() {
  return Boolean(
    process.env.APP_BASE_URL?.trim() &&
      process.env.CMU_ENTRA_TENANT_ID?.trim() &&
      process.env.CMU_ENTRA_CLIENT_ID?.trim() &&
      process.env.CMU_ENTRA_CLIENT_SECRET?.trim(),
  );
}

export function getCmuEntraConfig(): CmuEntraConfig {
  const appBaseUrl = normalizeBaseUrl(readRequiredEnv("APP_BASE_URL"));
  const tenantId = readRequiredEnv("CMU_ENTRA_TENANT_ID");
  const clientId = readRequiredEnv("CMU_ENTRA_CLIENT_ID");
  const clientSecret = readRequiredEnv("CMU_ENTRA_CLIENT_SECRET");
  const callbackPath = normalizePath(
    process.env.CMU_ENTRA_CALLBACK_PATH?.trim() || CMU_ENTRA_CALLBACK_PATH,
  );
  const authorizeUrl =
    getOptionalEndpoint("CMU_ENTRA_AUTHORIZE_URL") ||
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;
  const tokenUrl =
    getOptionalEndpoint("CMU_ENTRA_TOKEN_URL") ||
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const userinfoUrl =
    getOptionalEndpoint("CMU_ENTRA_USERINFO_URL") ||
    "https://graph.microsoft.com/oidc/userinfo";
  const basicInfoUrl = getOptionalBasicInfoUrl();
  const scope = process.env.CMU_ENTRA_SCOPE?.trim() || DEFAULT_SCOPE;

  return {
    appBaseUrl,
    tenantId,
    clientId,
    clientSecret,
    authorizeUrl,
    tokenUrl,
    basicInfoUrl,
    userinfoUrl,
    callbackPath,
    callbackUrl: `${appBaseUrl}${callbackPath}`,
    scope,
  };
}