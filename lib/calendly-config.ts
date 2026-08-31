/**
 * Server-only Calendly credentials.
 *
 * Both `CALENDLY_API_KEY` (Personal Access Token) and
 * `CALENDLY_EVENT_TYPE_URI` are required before the scheduling capability
 * may call Calendly. There is no event-type list or slug rediscovery.
 *
 * Never log, return, or put these values in a client bundle.
 */

export const CALENDLY_API_KEY_ENV = "CALENDLY_API_KEY" as const;
export const CALENDLY_EVENT_TYPE_URI_ENV = "CALENDLY_EVENT_TYPE_URI" as const;
export const CALENDLY_API_BASE = "https://api.calendly.com" as const;

function envString(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function calendlyApiKey(): string | undefined {
  return envString(CALENDLY_API_KEY_ENV);
}

export function calendlyEventTypeUriFromEnv(): string | undefined {
  return envString(CALENDLY_EVENT_TYPE_URI_ENV);
}

export function calendlyCredentialsPresent(): boolean {
  return Boolean(calendlyApiKey() && calendlyEventTypeUriFromEnv());
}

export function calendlyMissingEnvNames(): readonly string[] {
  const missing: string[] = [];
  if (!calendlyApiKey()) missing.push(CALENDLY_API_KEY_ENV);
  if (!calendlyEventTypeUriFromEnv()) missing.push(CALENDLY_EVENT_TYPE_URI_ENV);
  return missing;
}
