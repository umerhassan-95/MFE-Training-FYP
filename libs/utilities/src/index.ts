export function currency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function logger(scope: string) {
  const write = (level: string, message: string, meta?: Record<string, unknown>) => {
    const entry = {
      ts: new Date().toISOString(),
      level,
      scope,
      message,
      ...meta
    };
    if (level === 'error') {
      console.error(entry);
    } else {
      console.info(entry);
    }
  };

  return {
    info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta)
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${process.env.API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      'X-Guest-Id': getGuestId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

const GUEST_KEY = 'meridian:guest-id';

export function getGuestId(): string {
  if (typeof localStorage === 'undefined') return 'test-guest';
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}`;
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export const storage = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(key);
  }
};
