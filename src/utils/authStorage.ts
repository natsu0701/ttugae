const AUTH_KEY = "ttugae.auth.session.v1";

export type AuthSession = {
  loggedIn: true;
  loggedInAt: number;
};

export function loadAuthSession(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    return parsed?.loggedIn === true;
  } catch {
    return false;
  }
}

export function saveAuthSession(): void {
  const session: AuthSession = {
    loggedIn: true,
    loggedInAt: Date.now(),
  };
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } catch {
    // quota / private mode
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}
