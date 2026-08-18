"use client";

import { useEffect } from "react";
import { subscribeCalendlyScheduleTracking } from "./calendly-schedule-tracking";

/**
 * Attaches the /book Calendly completion listener. Renders nothing.
 * Safe if fbq is missing; unsubscribe on unmount.
 */
export function CalendlyScheduleTracker() {
  useEffect(() => subscribeCalendlyScheduleTracking(), []);
  return null;
}
