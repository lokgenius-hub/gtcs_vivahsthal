import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-[var(--color-charcoal)] py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            About <span className="text-gradient-gold">VivahSthal</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            We are India&apos;s premium wedding venue marketplace, connecting couples
            with the perfect venues for their dream celebrations. Our AI-powered
            platform makes venue discovery effortless, with real-time availability
            and dedicated Relationship Managers for every customer.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To simplify the wedding venue search for every Indian family.
                We believe every celebration deserves a perfect setting, and
                technology can bridge the gap between couples and their dream venues.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-4">Why Choose Us</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  500+ verified venues across India
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  AI-powered search & recommendations
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  Real-time slot availability
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  Dedicated Relationship Manager for every customer
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                  Auspicious date filtering
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-8">
            Have questions? We&apos;d love to hear from you.
          </p>
          <div className="space-y-3 text-gray-600">
            <p>Email: hello@vivahsthal.com</p>
            <p>Phone: +91 8XXX XXX XXX</p>
            <p>Address: Patna, Bihar, India</p>
          </div>
        </div>
      </section>
    </div>
  );
}
