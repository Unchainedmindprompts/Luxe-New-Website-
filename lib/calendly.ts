const CALENDLY_BASE = "https://api.calendly.com";

function getApiKey(): string {
  const key = process.env.CALENDLY_API_KEY?.trim();
  if (!key) throw new Error("CALENDLY_API_KEY is not set");
  return key;
}

async function calendlyFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${CALENDLY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Calendly API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as T;
}

let cachedUserUri: string | null = null;

async function getCalendlyUserUri(): Promise<string> {
  if (cachedUserUri) return cachedUserUri;
  const data = await calendlyFetch<{ resource: { uri: string } }>("/users/me");
  cachedUserUri = data.resource.uri;
  return cachedUserUri;
}

let cachedEventTypeUri: string | null = null;

async function getConsultationEventTypeUri(): Promise<string> {
  if (cachedEventTypeUri) return cachedEventTypeUri;
  const userUri = await getCalendlyUserUri();
  const data = await calendlyFetch<{
    collection: Array<{ name: string; uri: string }>;
  }>(`/event_types?user=${encodeURIComponent(userUri)}&active=true&count=100`);

  const eventType = data.collection.find(
    (et) =>
      et.name.toLowerCase().includes("consultation") ||
      et.name.toLowerCase().includes("in-home") ||
      et.name.toLowerCase().includes("in home")
  );

  if (!eventType) {
    if (data.collection.length > 0) {
      cachedEventTypeUri = data.collection[0].uri;
      return cachedEventTypeUri;
    }
    throw new Error("No active Calendly event types found");
  }

  cachedEventTypeUri = eventType.uri;
  return cachedEventTypeUri;
}

export function formatSlotForDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export async function getAvailableSlots(date: string): Promise<string[]> {
  // date: YYYY-MM-DD (customer's date in Pacific time)
  // Use -08:00 offset to cover the full Pacific day regardless of DST
  const startOfDay = new Date(`${date}T00:00:00-08:00`);
  const endOfDay = new Date(`${date}T23:59:59-08:00`);

  const eventTypeUri = await getConsultationEventTypeUri();
  const data = await calendlyFetch<{
    collection: Array<{ status: string; start_time: string }>;
  }>(
    `/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${encodeURIComponent(startOfDay.toISOString())}&end_time=${encodeURIComponent(endOfDay.toISOString())}`
  );

  return data.collection
    .filter((slot) => slot.status === "available")
    .map((slot) => slot.start_time);
}

export async function createSchedulingLink(name: string, email: string): Promise<string> {
  const eventTypeUri = await getConsultationEventTypeUri();
  const data = await calendlyFetch<{ resource: { booking_url: string } }>(
    "/scheduling_links",
    {
      method: "POST",
      body: JSON.stringify({
        max_event_count: 1,
        owner: eventTypeUri,
        owner_type: "EventType",
      }),
    }
  );
  const url = new URL(data.resource.booking_url);
  url.searchParams.set("name", name);
  url.searchParams.set("email", email);
  return url.toString();
}
