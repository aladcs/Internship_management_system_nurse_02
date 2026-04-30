export const APP_BASE_PATH = "/intern";
export const BRAND_LOGO_PATH = `${APP_BASE_PATH}/nurse_logo.svg`;
export const GOOGLE_LOGO_PATH = `${APP_BASE_PATH}/google-logo.svg`;
export const CMU_LOGIN_BANNER_PATH = `${APP_BASE_PATH}/login_cmu.png`;

function normalizePath(path: string) {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function isAppExternalPath(pathname: string) {
  return pathname === APP_BASE_PATH || pathname.startsWith(`${APP_BASE_PATH}/`);
}

export function stripAppBasePath(pathname: string) {
  const normalizedPath = normalizePath(pathname);

  if (!isAppExternalPath(normalizedPath)) {
    return normalizedPath;
  }

  const strippedPath = normalizedPath.slice(APP_BASE_PATH.length);

  return strippedPath ? normalizePath(strippedPath) : "/";
}

export function withAppBasePath(pathname: string) {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === "/") {
    return APP_BASE_PATH;
  }

  if (isAppExternalPath(normalizedPath)) {
    return normalizedPath;
  }

  return `${APP_BASE_PATH}${normalizedPath}`;
}
