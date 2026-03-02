"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Sun, Moon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateVenueSlot } from "@/lib/actions";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startDay = monthStart.getDay();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Availability Calendar</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your venue&apos;s slot availability</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month starts */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16" />
          ))}

          {days.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`h-16 rounded-lg text-sm transition-all relative group ${
                isToday(day)
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold"
                  : selectedDate && day.toDateString() === selectedDate.toDateString()
                  ? "bg-gradient-gold text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="absolute top-2 left-2">{format(day, "d")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slot Management */}
      {selectedDate && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Slots for {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { type: "morning", label: "Morning", icon: Sun, time: "6:00 AM - 2:00 PM", color: "bg-amber-50 border-amber-200 text-amber-700" },
              { type: "evening", label: "Evening", icon: Moon, time: "4:00 PM - 12:00 AM", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
              { type: "full_day", label: "Full Day", icon: Clock, time: "6:00 AM - 12:00 AM", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
            ].map((slot) => (
              <div
                key={slot.type}
                className={`rounded-xl p-4 border-2 ${slot.color}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <slot.icon className="h-5 w-5" />
                  <h4 className="font-semibold">{slot.label}</h4>
                </div>
                <p className="text-xs opacity-75 mb-3">{slot.time}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1 text-xs">
                    Available
                  </Button>
                  <Button size="sm" variant="accent" className="flex-1 text-xs">
                    Booked
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-green-400" /> Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-400" /> Booked
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-400" /> Auspicious Date
        </div>
      </div>
    </div>
  );
}
