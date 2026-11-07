// Small fetch wrapper: adds the token, parses JSON and turns failures
// into ApiError objects with a readable message and per-field errors.

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'tm_token';

export const tokenStore = {
  get() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },
  // "Keep me logged in" keeps the token after the browser closes;
  // otherwise it lasts for this browser session only.
  set(token, remember) {
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

const FALLBACK_MESSAGES = {
  400: 'Some of the details need fixing.',
  401: 'Your session has ended. Log in again.',
  403: "You don't have permission to do that.",
  404: "That couldn't be found. It may have been deleted.",
  429: 'Too many attempts. Wait a few minutes, then try again.',
  500: 'The server ran into a problem. Try again in a moment.',
};

// Accepts the common shapes: { errors: { field: msg } },
// express-validator's { errors: [{ path, msg }] } and { error: { fields } }.
function readFieldErrors(data) {
  const source = data?.errors ?? data?.error?.fields ?? data?.fields;
  if (Array.isArray(source)) {
    return source.reduce((acc, item) => {
      const key = item.path || item.param || item.field;
      if (key && !acc[key]) acc[key] = item.msg || item.message;
      return acc;
    }, {});
  }
  if (source && typeof source === 'object') {
    return Object.fromEntries(
      Object.entries(source).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : value?.message || String(value),
      ]),
    );
  }
  return {};
}

function readMessage(data, status) {
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.error?.message === 'string') return data.error.message;
  return FALLBACK_MESSAGES[status] || `Request failed (${status}).`;
}

export async function request(path, { method = 'GET', body, params } = {}) {
  let url = BASE_URL + path;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const isLoginAttempt = path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register');
    if (response.status === 401 && token && !isLoginAttempt) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(readMessage(data, response.status), response.status, readFieldErrors(data));
  }
  return data;
}
