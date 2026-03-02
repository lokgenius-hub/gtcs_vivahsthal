"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, Phone, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description:
      "Browse venues by city, capacity, budget, or ask our AI assistant for personalized recommendations.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: CalendarCheck,
    title: "Check Availability",
    description:
      "View real-time slot availability. Filter by morning, evening, or full-day. Check auspicious dates.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Phone,
    title: "Connect & Visit",
    description:
      "Our Relationship Manager connects you with the venue. Schedule a visit and finalize details.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: PartyPopper,
    title: "Celebrate!",
    description:
      "Book your dream venue and make lasting memories. We're with you every step of the way.",
    color: "bg-rose-50 text-rose-600",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-[var(--color-cream)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-charcoal)] mb-4">
            How <span className="text-gradient-gold">VivahSthal</span> Works
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From discovery to celebration, we make finding your perfect wedding venue effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center group"
            >
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px border-t-2 border-dashed border-gray-200" />
              )}

              <div className={`inline-flex h-20 w-20 rounded-2xl ${step.color} items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <step.icon className="h-9 w-9" />
              </div>
              <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-gold text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-charcoal)] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
