/** The official embed must be initialized for every client-side page visit. */
export const CALENDLY_SCRIPT_URL = "https://assets.calendly.com/assets/external/widget.js";
export const CALENDLY_ORIGIN = "https://calendly.com";
export const CALENDLY_LOAD_TIMEOUT = 15000;

type CalendlyApi = {
  initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
};

declare global {
  interface Window { Calendly?: CalendlyApi }
}

let scriptPromise: Promise<CalendlyApi> | undefined;

// Keep one script across route changes. A failed request is removed and may
// be retried; a successful script is reused, but its one-time auto-scan is not.
export function loadCalendly(): Promise<CalendlyApi> {
  if (window.Calendly?.initInlineWidget) return Promise.resolve(window.Calendly);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<CalendlyApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_URL;
    script.async = true;
    const fail = () => {
      clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
      script.remove();
      scriptPromise = undefined;
      reject(new Error("Calendly script unavailable"));
    };
    script.onload = () => {
      if (!window.Calendly?.initInlineWidget) { fail(); return; }
      clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
      resolve(window.Calendly);
    };
    script.onerror = fail;
    const timer = setTimeout(fail, CALENDLY_LOAD_TIMEOUT);
    document.head.appendChild(script);
  });
  return scriptPromise;
}

const READY_EVENTS = new Set([
  "calendly.event_type_viewed",
  "calendly.date_and_time_selected",
  "calendly.event_scheduled",
]);

export function isCurrentCalendlyMessage(event: MessageEvent, parent: HTMLElement) {
  const frame = parent.querySelector("iframe");
  return event.origin === CALENDLY_ORIGIN &&
    !!frame?.contentWindow && event.source === frame.contentWindow &&
    !!event.data && typeof event.data === "object" &&
    READY_EVENTS.has(event.data.event);
}

export function mountCalendly(
  parent: HTMLElement,
  url: string,
  onReady: () => void,
  onUnavailable: () => void,
  load: () => Promise<CalendlyApi> = loadCalendly,
) {
  let active = true;
  let ready = false;
  const timer = setTimeout(() => { if (active && !ready) onUnavailable(); }, CALENDLY_LOAD_TIMEOUT);
  const receive = (event: MessageEvent) => {
    // iframe load also fires for provider error pages, so it is not proof that
    // the booking calendar loaded. Accept only this embed's documented event.
    if (!active || ready || !isCurrentCalendlyMessage(event, parent)) return;
    ready = true;
    clearTimeout(timer);
    onReady();
  };
  window.addEventListener("message", receive);
  load().then((calendly) => {
    if (!active) return;
    parent.replaceChildren();
    calendly.initInlineWidget({ url, parentElement: parent });
  }).catch(() => {
    if (active) { clearTimeout(timer); onUnavailable(); }
  });
  return () => {
    active = false;
    clearTimeout(timer);
    window.removeEventListener("message", receive);
    parent.replaceChildren();
  };
}
