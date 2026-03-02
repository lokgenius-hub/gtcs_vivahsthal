"use client";

import { motion } from "framer-motion";
import { MapPin, Building, Users, Star } from "lucide-react";

const stats = [
  { icon: Building, label: "Venues Listed", value: "500+", color: "text-[var(--color-primary)]" },
  { icon: MapPin, label: "Cities Covered", value: "25+", color: "text-blue-600" },
  { icon: Users, label: "Happy Couples", value: "10,000+", color: "text-rose-600" },
  { icon: Star, label: "Average Rating", value: "4.8", color: "text-amber-500" },
];

export function Stats() {
  return (
    <section className="py-14 bg-white border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className={`h-7 w-7 mx-auto mb-2 ${stat.color}`} />
              <p className="text-3xl font-bold text-[var(--color-charcoal)]">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
