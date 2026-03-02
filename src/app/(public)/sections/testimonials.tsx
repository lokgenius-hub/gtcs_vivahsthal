"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya & Arjun",
    location: "Patna",
    rating: 5,
    text: "VivahSthal made our venue search so easy! The AI assistant suggested the perfect heritage venue in Patna. Our wedding was absolutely magical.",
    avatar: "PA",
  },
  {
    name: "Sneha & Rohan",
    location: "Gaya",
    rating: 5,
    text: "We found our dream farmhouse within minutes. The auspicious date filter was incredibly helpful for our traditional ceremony. Highly recommended!",
    avatar: "SR",
  },
  {
    name: "Anita & Vikram",
    location: "Muzaffarpur",
    rating: 5,
    text: "The Relationship Manager assigned to us was amazing. They helped negotiate the best price and ensured everything was perfect for our big day.",
    avatar: "AV",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-charcoal)] mb-4">
            Love <span className="text-gradient-gold">Stories</span>
          </h2>
          <p className="text-gray-500">
            Hear from couples who found their perfect venue on VivahSthal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-[var(--color-cream)] rounded-2xl p-6 relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-[var(--color-primary)]/10" />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-gold flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-charcoal)]">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
