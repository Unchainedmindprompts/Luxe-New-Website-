/**
 * Server-only Calendly credentials.
 *
 * `CALENDLY_API_KEY` is the existing Personal Access Token name already
 * documented in `.env.local.example`. `CALENDLY_EVENT_TYPE_URI` is optional:
 * when it is absent, the client resolves the Luxe consultation event type
 * from `GET /event_types` by matching slug `2hr` / the public scheduling URL.
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
  return Boolean(calendlyApiKey());
}

export function calendlyMissingEnvNames(): readonly string[] {
  return calendlyApiKey() ? [] : [CALENDLY_API_KEY_ENV];
}
