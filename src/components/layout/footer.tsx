import Link from "next/link";
import { Heart, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";

const footerLinks = {
  "Popular Cities": [
    { label: "Patna", href: "/venues?city=Patna" },
    { label: "Gaya", href: "/venues?city=Gaya" },
    { label: "Muzaffarpur", href: "/venues?city=Muzaffarpur" },
    { label: "Bhagalpur", href: "/venues?city=Bhagalpur" },
    { label: "Delhi", href: "/venues?city=Delhi" },
  ],
  "Venue Types": [
    { label: "Banquet Halls", href: "/venues?type=banquet_hall" },
    { label: "Farmhouses", href: "/venues?type=farmhouse" },
    { label: "Resorts", href: "/venues?type=resort" },
    { label: "Lawns & Gardens", href: "/venues?type=lawn" },
    { label: "Heritage Venues", href: "/venues?type=heritage" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "List Your Venue", href: "/partner-register" },
    { label: "Contact", href: "/about#contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--color-charcoal)] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-gradient-gold">Vivah</span>
                <span className="text-white">Sthal</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              India&apos;s premium wedding venue marketplace. Find the perfect
              venue for your dream celebration with AI-powered search and
              real-time availability.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary-light)] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary-light)] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary-light)] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[var(--color-primary-light)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} VivahSthal. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-[var(--color-accent)] fill-current" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
