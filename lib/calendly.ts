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

interface LocationConfig {
  kind: string;
  location?: string;
  additional_info?: string;
}

interface EventTypeInfo {
  uri: string;
  locationConfigs: LocationConfig[];
}

let cachedEventType: EventTypeInfo | null = null;

async function getConsultationEventType(): Promise<EventTypeInfo> {
  if (cachedEventType) return cachedEventType;
  const userUri = await getCalendlyUserUri();
  const data = await calendlyFetch<{
    collection: Array<{
      name: string;
      uri: string;
      location_configurations?: LocationConfig[];
      locations?: LocationConfig[];
    }>;
  }>(`/event_types?user=${encodeURIComponent(userUri)}&active=true&count=100`);

  const match = data.collection.find(
    (et) =>
      et.name.toLowerCase().includes("consultation") ||
      et.name.toLowerCase().includes("in-home") ||
      et.name.toLowerCase().includes("in home")
  ) ?? data.collection[0];

  if (!match) throw new Error("No active Calendly event types found");

  cachedEventType = {
    uri: match.uri,
    locationConfigs: match.location_configurations ?? match.locations ?? [],
  };
  return cachedEventType;
}

// Keep a simple URI getter for the availability functions
async function getConsultationEventTypeUri(): Promise<string> {
  return (await getConsultationEventType()).uri;
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

// Fetch available slots grouped by date (YYYY-MM-DD Pacific) for a date range.
// Handles the Calendly 7-day API limit by splitting into chunks internally.
export async function getAvailableSlotsForRange(
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<Record<string, string[]>> {
  const eventTypeUri = await getConsultationEventTypeUri();

  const rangeStart = new Date(`${startDate}T00:00:00-08:00`);
  const rangeEnd = new Date(`${endDate}T23:59:59-08:00`);

  // Split into ≤7-day chunks and fetch in parallel
  const fetches: Promise<{ collection: Array<{ status: string; start_time: string }> }>[] = [];
  let cursor = new Date(rangeStart);

  while (cursor < rangeEnd) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setDate(chunkEnd.getDate() + 6);
    if (chunkEnd > rangeEnd) chunkEnd.setTime(rangeEnd.getTime());

    const s = encodeURIComponent(cursor.toISOString());
    const e = encodeURIComponent(chunkEnd.toISOString());
    fetches.push(
      calendlyFetch<{ collection: Array<{ status: string; start_time: string }> }>(
        `/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${s}&end_time=${e}`
      )
    );

    cursor = new Date(chunkEnd);
    cursor.setDate(cursor.getDate() + 1);
  }

  const results = await Promise.all(fetches);

  const byDate: Record<string, string[]> = {};
  for (const result of results) {
    for (const slot of result.collection) {
      if (slot.status !== "available") continue;
      // en-CA locale returns YYYY-MM-DD format natively
      const dateKey = new Date(slot.start_time).toLocaleDateString("en-CA", {
        timeZone: "America/Los_Angeles",
      });
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(slot.start_time);
    }
  }

  return byDate;
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

// Returns the raw event type info so we can inspect it for debugging.
export async function getEventTypeDebugInfo(): Promise<EventTypeInfo> {
  return getConsultationEventType();
}

// Directly create a Calendly booking via the Scheduling API (no link required).
// Requires a paid Calendly plan.
export async function createInvitee(params: {
  name: string;
  email: string;
  startTime: string; // ISO UTC string
  address?: string;
}): Promise<{ uri: string; name: string; email: string; start_time: string }> {
  const eventType = await getConsultationEventType();

  // Note: we intentionally omit the `location` field from the API call.
  // Calendly's location field requires an exact kind match with the event type's
  // configured locations (physical, ask_invitee, etc.). Sending the wrong kind
  // causes a 400 error. Omitting it lets Calendly use its default location
  // behavior. The customer's address is captured in our booking panel form and
  // shown in the chat confirmation message for Mark's reference.
  const body: Record<string, unknown> = {
    event_type: eventType.uri,
    start_time: params.startTime,
    invitee: {
      name: params.name,
      email: params.email,
      timezone: "America/Los_Angeles",
    },
  };

  const data = await calendlyFetch<{
    resource: { uri: string; name: string; email: string; start_time: string };
  }>("/invitees", { method: "POST", body: JSON.stringify(body) });
  return data.resource;
}
