"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Phone, MessageSquare, X, PhoneCall, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getVenueSlots } from "@/lib/actions";
import { LeadForm } from "@/components/venue/lead-form";
import type { VenueSlot } from "@/lib/types";

interface Props {
  venueId: string;
  venueName: string;
  vendorPhone: string | null;
  vendorName: string | null;
}

type ModalView = "options" | "enquiry";

export function AvailabilityCalendar({ venueId, venueName, vendorPhone, vendorName }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<VenueSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalView, setModalView] = useState<ModalView>("options");
  const [showPhone, setShowPhone] = useState(false);

  const monthKey = format(currentMonth, "yyyy-MM");

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    const data = await getVenueSlots(venueId, monthKey);
    setSlots(data);
    setLoading(false);
  }, [venueId, monthKey]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();
  const today = startOfDay(new Date());

  /** All slots for a given day */
  const slotsForDay = (day: Date) =>
    slots.filter((s) => s.slot_date === format(day, "yyyy-MM-dd"));

  /** Visual state of a day */
  const getDayState = (day: Date): "past" | "booked" | "available" | "auspicious" | "empty" => {
    if (isBefore(day, today)) return "past";
    const daySlots = slotsForDay(day);
    if (daySlots.length === 0) return "empty";
    const hasAuspicious = daySlots.some((s) => s.is_auspicious && s.is_available);
    if (hasAuspicious) return "auspicious";
    const hasAvailable = daySlots.some((s) => s.is_available);
    if (hasAvailable) return "available";
    return "booked";
  };

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;
    setSelectedDate(day);
    setModalView("options");
    setShowPhone(false);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setShowPhone(false);
  };

  const formattedSelected = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const selectedDaySlots = selectedDate ? slotsForDay(selectedDate) : [];
  const selectedState = selectedDate ? getDayState(selectedDate) : "empty";

  return (
    <>
      {/* ── Calendar ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-bold text-[var(--color-charcoal)]">Availability</h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold px-2 min-w-[110px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-green-400 inline-block" /> Available</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-400 inline-block" /> Auspicious</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-400 inline-block" /> Booked</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-gray-200 inline-block" /> No data</span>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-11 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map((day) => {
              const state = getDayState(day);
              const isSelected = selectedDate && format(day, "yyyy-MM-dd") === formattedSelected;
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  disabled={state === "past"}
                  className={`relative h-11 w-full rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5
                    ${state === "past" ? "text-gray-300 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                    ${isSelected ? "ring-2 ring-[var(--color-primary)] ring-offset-1" : ""}
                    ${state === "auspicious" ? "bg-amber-50 text-amber-800" : ""}
                    ${state === "available" ? "bg-green-50 text-green-800" : ""}
                    ${state === "booked" ? "bg-red-50 text-red-800" : ""}
                    ${state === "empty" ? "bg-gray-50 text-gray-600 hover:bg-gray-100" : ""}
                  `}
                >
                  <span>{format(day, "d")}</span>
                  {state !== "past" && state !== "empty" && (
                    <span className={`h-1.5 w-1.5 rounded-full
                      ${state === "auspicious" ? "bg-amber-400" : ""}
                      ${state === "available" ? "bg-green-400" : ""}
                      ${state === "booked" ? "bg-red-400" : ""}
                    `} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Date Selected Modal ── */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-gold px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs">Selected Date</p>
                  <p className="text-white font-bold text-lg">{format(selectedDate, "EEEE, d MMMM yyyy")}</p>
                  <p className="text-white/80 text-xs mt-0.5">
                    {selectedState === "available" && "✓ Available"}
                    {selectedState === "auspicious" && "★ Auspicious date — highly recommended!"}
                    {selectedState === "booked" && "✗ Fully booked"}
                    {selectedState === "empty" && "No slot data — contact for availability"}
                  </p>
                </div>
                <button onClick={closeModal} className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {modalView === "options" ? (
                <div className="p-5 space-y-3">
                  {/* Slot info */}
                  {selectedDaySlots.length > 0 && (
                    <div className="text-xs text-gray-500 flex flex-wrap gap-2 mb-1">
                      {selectedDaySlots.map((s) => (
                        <span key={s.id} className={`px-2 py-1 rounded-full font-medium capitalize
                          ${s.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {s.slot_type.replace("_", " ")} — {s.is_available ? "Available" : "Booked"}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 font-medium">How would you like to proceed?</p>

                  {/* Option 1: Enquiry */}
                  <button
                    onClick={() => setModalView("enquiry")}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-[var(--color-primary)]/20 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
                      <MessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[var(--color-charcoal)]">Send Enquiry</p>
                      <p className="text-xs text-gray-500">Submit your details — we&apos;ll reply within 30 min</p>
                    </div>
                  </button>

                  {/* Option 2: View contact */}
                  {vendorPhone ? (
                    <button
                      onClick={() => setShowPhone(!showPhone)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Phone className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-[var(--color-charcoal)]">Contact Vendor</p>
                        <p className="text-xs text-gray-500">
                          {showPhone ? (
                            <span className="text-[var(--color-primary)] font-semibold text-sm">{vendorPhone}</span>
                          ) : "Tap to reveal phone number"}
                        </p>
                      </div>
                    </button>
                  ) : null}

                  {/* Option 3: Call now */}
                  {vendorPhone && (
                    <a href={`tel:${vendorPhone}`} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all group">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <PhoneCall className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-green-700">Call Now</p>
                        <p className="text-xs text-gray-500">Directly call the venue owner</p>
                      </div>
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-5">
                  <button
                    onClick={() => setModalView("options")}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
                  >
                    ← Back to options
                  </button>
                  <LeadForm
                    venueId={venueId}
                    venueName={venueName}
                    trigger="availability"
                    defaultDate={formattedSelected}
                    inline
                    onClose={closeModal}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
