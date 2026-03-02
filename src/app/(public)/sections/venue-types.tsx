"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  TreePine,
  Hotel,
  Palmtree,
  Landmark,
  Crown,
  Church,
  Users,
} from "lucide-react";

const types = [
  { icon: Building2, label: "Banquet Halls", value: "banquet_hall", color: "from-amber-500 to-orange-600" },
  { icon: TreePine, label: "Farmhouses", value: "farmhouse", color: "from-green-500 to-emerald-600" },
  { icon: Hotel, label: "Hotels & Resorts", value: "resort", color: "from-blue-500 to-indigo-600" },
  { icon: Palmtree, label: "Lawns & Gardens", value: "lawn", color: "from-lime-500 to-green-600" },
  { icon: Crown, label: "Palaces", value: "palace", color: "from-purple-500 to-violet-600" },
  { icon: Landmark, label: "Heritage Venues", value: "heritage", color: "from-rose-500 to-pink-600" },
  { icon: Church, label: "Temples", value: "temple", color: "from-orange-500 to-red-600" },
  { icon: Users, label: "Community Halls", value: "community_hall", color: "from-cyan-500 to-blue-600" },
];

export function VenueTypes() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-charcoal)] mb-4">
            Browse by <span className="text-gradient-gold">Venue Type</span>
          </h2>
          <p className="text-gray-500">
            Every celebration deserves its perfect setting
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {types.map((type, i) => (
            <motion.div
              key={type.value}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/venues?type=${type.value}`}
                className="group block p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <type.icon className="h-10 w-10 mx-auto mb-3 text-gray-600 group-hover:text-white transition-colors" />
                  <p className="text-sm font-medium text-gray-800 group-hover:text-white transition-colors">
                    {type.label}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
