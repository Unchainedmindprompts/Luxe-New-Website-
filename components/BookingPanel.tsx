"use client";

import { useState, useEffect, useCallback } from "react";

export interface ConfirmedAppointment {
  name: string;
  email: string;
  phone: string;
  address: string;
  startTime: string; // ISO UTC
}

interface BookingPanelProps {
  onClose: () => void;
  onConfirmed: (details: ConfirmedAppointment) => void;
}

// ---------- helpers ----------

// Deterministic pseudo-random seeded by a string — ensures the same date
// always shows the same fake-busy slots across renders.
function seededRand(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => {
    h ^= h << 13;
    h ^= h >> 7;
    h ^= h << 17;
    h = h >>> 0;
    return h / 0xffffffff;
  };
}

function isFakeBusy(slotIso: string, dateKey: string): boolean {
  return seededRand(dateKey + slotIso)() < 0.35;
}

function toDateKey(date: Date): string {
  // Returns YYYY-MM-DD in Pacific time
  return date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatConfirmDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ---------- component ----------

export default function BookingPanel({ onClose, onConfirmed }: BookingPanelProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = toDateKey(tomorrow);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calendar state
  const [viewYear, setViewYear] = useState(tomorrow.getFullYear());
  const [viewMonth, setViewMonth] = useState(tomorrow.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Availability data: dateKey → array of real Calendly ISO slot strings
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loadingCal, setLoadingCal] = useState(false);
  const [calError, setCalError] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch availability for the viewed month
  const fetchMonth = useCallback(async (year: number, month: number) => {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Don't fetch past months
    if (lastOfMonth < tomorrow) return;

    const start = firstOfMonth < tomorrow ? tomorrowKey : toDateKey(firstOfMonth);
    const end = toDateKey(lastOfMonth);

    setLoadingCal(true);
    setCalError(null);
    try {
      const res = await fetch(`/api/availability?start=${start}&end=${end}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setAvailability((prev) => ({ ...prev, ...(data.slots as Record<string, string[]>) }));
    } catch (err) {
      setCalError(err instanceof Error ? err.message : "Could not load availability");
    } finally {
      setLoadingCal(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tomorrowKey]);

  useEffect(() => {
    fetchMonth(viewYear, viewMonth);
  }, [viewYear, viewMonth, fetchMonth]);

  // Calendar grid helpers
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function dayKey(day: number): string {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function dayIsPast(day: number): boolean {
    return dayKey(day) < tomorrowKey;
  }

  // A day has bookable slots if any real Calendly slot is NOT fake-busy
  function dayHasSlots(day: number): boolean {
    const key = dayKey(day);
    return (availability[key] ?? []).some((s) => !isFakeBusy(s, key));
  }

  // Month navigation limits: today's month → 3 months out
  const minYear = tomorrow.getFullYear();
  const minMonth = tomorrow.getMonth();
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxYear = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth();

  const canGoPrev =
    viewYear > minYear || (viewYear === minYear && viewMonth > minMonth);
  const canGoNext =
    viewYear < maxYear || (viewYear === maxYear && viewMonth < maxMonth);

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function nextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
    setSelectedDate(null);
    setSelectedTime(null);
  }

  // Slots for selected date: real + annotated with fake-busy flag
  const rawSlots = selectedDate ? (availability[selectedDate] ?? []) : [];
  const annotatedSlots = rawSlots.map((s) => ({
    iso: s,
    busy: isFakeBusy(s, selectedDate!),
  }));

  // Validation
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleConfirm() {
    if (!validate()) return;
    if (!selectedDate || !selectedTime) {
      setSubmitError("Please select a date and time.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          startTime: selectedTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      onConfirmed({
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        startTime: selectedTime,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please call Mark at 208-660-8643."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function inputCls(field: string) {
    return `w-full bg-white border rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors ${
      errors[field] ? "border-red-400" : "border-warm-gray-200"
    }`;
  }

  const calendarCells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-charcoal text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-semibold">Book Your Free In-Home Consultation</h2>
            <p className="text-warm-gray-400 text-xs mt-0.5">With Mark · Luxe Window Works · Post Falls, ID</p>
          </div>
          <button
            onClick={onClose}
            className="text-warm-gray-400 hover:text-white transition-colors p-1 ml-4 flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Left column: Contact form ── */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide">Your Information</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={inputCls("firstName")}
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <input
                    className={inputCls("lastName")}
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <input
                  type="email"
                  className={inputCls("email")}
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <input
                  type="tel"
                  className={inputCls("phone")}
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <input
                  className={inputCls("address")}
                  placeholder="Home Address (for the in-home visit)"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Appointment summary */}
              {selectedDate && selectedTime && (
                <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mt-1">
                  <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1.5">Selected Appointment</p>
                  <p className="text-sm font-semibold text-charcoal">{formatDateLong(selectedDate)}</p>
                  <p className="text-sm text-charcoal">{formatTime(selectedTime)} Pacific Time</p>
                  <p className="text-xs text-warm-gray-500 mt-1.5">2-hour in-home consultation · Free</p>
                </div>
              )}
            </div>

            {/* ── Right column: Calendar + time slots ── */}
            <div>
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={prevMonth}
                  disabled={!canGoPrev}
                  className="p-1.5 rounded-lg hover:bg-warm-gray-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-charcoal">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  onClick={nextMonth}
                  disabled={!canGoNext}
                  className="p-1.5 rounded-lg hover:bg-warm-gray-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-warm-gray-400 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {calendarCells.map((day, idx) => {
                  if (!day) return <div key={`blank-${idx}`} />;
                  const key = dayKey(day);
                  const past = dayIsPast(day);
                  const hasSlots = dayHasSlots(day);
                  const isSelected = selectedDate === key;

                  return (
                    <button
                      key={key}
                      disabled={past || !hasSlots}
                      onClick={() => {
                        setSelectedDate(key);
                        setSelectedTime(null);
                      }}
                      className={[
                        "relative h-9 w-full rounded-lg text-xs font-medium transition-all",
                        isSelected
                          ? "bg-gold text-white shadow-sm"
                          : hasSlots && !past
                          ? "text-charcoal hover:bg-gold/15 cursor-pointer"
                          : "text-warm-gray-300 cursor-not-allowed",
                      ].join(" ")}
                    >
                      {day}
                      {hasSlots && !past && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Loading / error */}
              {loadingCal && (
                <div className="flex items-center justify-center gap-2 text-xs text-warm-gray-400 mt-3">
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading Mark&apos;s availability...
                </div>
              )}
              {calError && (
                <p className="text-xs text-red-500 text-center mt-2">{calError}</p>
              )}

              {/* Legend */}
              {!loadingCal && (
                <div className="flex items-center gap-4 mt-3 text-xs text-warm-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                    Open
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-gold inline-block" />
                    Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-warm-gray-200 inline-block" />
                    Unavailable
                  </span>
                </div>
              )}

              {/* Time slots */}
              {selectedDate && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wide mb-2">
                    {MONTH_NAMES[parseInt(selectedDate.split("-")[1]) - 1]}{" "}
                    {parseInt(selectedDate.split("-")[2])} — Select a Time
                  </p>

                  {annotatedSlots.length === 0 && !loadingCal && (
                    <p className="text-xs text-warm-gray-400">No times available — pick another day.</p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {annotatedSlots.map(({ iso, busy }) => (
                      <button
                        key={iso}
                        disabled={busy}
                        onClick={() => setSelectedTime(iso)}
                        className={[
                          "text-sm py-2 px-3 rounded-lg border font-medium transition-all",
                          busy
                            ? "bg-warm-gray-50 text-warm-gray-300 border-warm-gray-100 cursor-not-allowed"
                            : selectedTime === iso
                            ? "bg-gold text-white border-gold shadow-sm"
                            : "bg-white text-charcoal border-warm-gray-200 hover:border-gold hover:bg-gold/5 cursor-pointer",
                        ].join(" ")}
                      >
                        {busy ? (
                          <span className="line-through">{formatTime(iso)}</span>
                        ) : (
                          formatTime(iso)
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer — confirm button */}
        <div className="px-6 py-4 border-t border-warm-gray-200/60 flex-shrink-0 bg-white rounded-b-2xl">
          {submitError && (
            <p className="text-red-500 text-sm text-center mb-3">{submitError}</p>
          )}
          <button
            onClick={handleConfirm}
            disabled={submitting || !selectedDate || !selectedTime}
            className="w-full bg-gold hover:bg-gold-dark disabled:bg-warm-gray-200 disabled:text-warm-gray-400 text-white font-semibold py-3.5 rounded-xl text-base transition-colors"
          >
            {submitting ? "Booking your appointment…" : "Confirm Appointment"}
          </button>
          <p className="text-center text-xs text-warm-gray-400 mt-2.5">
            Free in-home consultation · No obligation · Mark will confirm by phone
          </p>
        </div>
      </div>
    </div>
  );
}

// Re-export for use in confirmation message formatting
export { formatConfirmDateTime };
