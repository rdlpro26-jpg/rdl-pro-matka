const AUTH_KEY = 'rdl_admin_auth';
const PASSWORD_KEY = 'rdl_admin_password_hash';

const DEFAULT_PASSWORD = 'admin123';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return String(hash);
}

export function getPasswordHash(): string {
  try {
    const stored = localStorage.getItem(PASSWORD_KEY);
    return stored ?? simpleHash(DEFAULT_PASSWORD);
  } catch {
    return simpleHash(DEFAULT_PASSWORD);
  }
}

export function setPassword(password: string): void {
  localStorage.setItem(PASSWORD_KEY, simpleHash(password));
}

export function verifyPassword(password: string): boolean {
  return simpleHash(password) === getPasswordHash();
}

export function isAuthed(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAuthed(value: boolean): void {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}
