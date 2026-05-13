// Auth helpers — all localStorage access is guarded against SSR (server has no window).

export function setToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setRefreshToken(refreshToken) {
  if (typeof window === "undefined") return;
  localStorage.setItem("refresh_token", refreshToken);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
}

export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}
