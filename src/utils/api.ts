const configuredBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${configuredBase}${path}`;
}

export function getApiBaseUrl(): string {
  return configuredBase;
}
