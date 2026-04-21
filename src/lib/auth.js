export function saveTokens(accessToken, refreshToken) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("current_user");
}

export function saveUser(user) {
  localStorage.setItem("current_user", JSON.stringify(user));
}

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem("current_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

export function getRole() {
  const user = getUser();
  return user?.role || null;
}
