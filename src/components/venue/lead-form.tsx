"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createLead } from "@/lib/actions";
import { SLOT_TYPES, BUDGET_RANGES } from "@/lib/constants";
interface LeadFormProps {
  venueId?: string;
  venueName?: string;
  trigger?: "contact" | "availability";
  defaultDate?: string;
  onClose?: () => void;
  /** When true renders the form directly — no trigger button, no overlay */
  inline?: boolean;
}

/** Reusable form fields used in both inline and modal mode */
function EnquiryForm({
  venueId,
  venueName,
  trigger,
  defaultDate,
  onDone,
  onClose,
}: {
  venueId?: string;
  venueName?: string;
  trigger: "contact" | "availability";
  defaultDate?: string;
  onDone: () => void;
  onClose?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setFormError("");
    if (venueId) formData.set("venue_id", venueId);
    formData.set("source", trigger === "contact" ? "view_contact" : "check_availability");
    const result = await createLead(formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onDone();
        onClose?.();
      }, 2500);
    } else {
      setFormError(result.error || "Failed to send enquiry. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enquiry Sent!</h3>
        <p className="text-gray-500 text-sm">
          Our team will contact you within 30 minutes.
          {venueName && ` We&apos;ve notified ${venueName} about your interest.`}
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="customer_name" label="Your Full Name" placeholder="Enter your name" required />
      <Input name="customer_phone" label="Phone Number" type="tel" placeholder="+91 XXXXX XXXXX" required />
      <Input name="customer_email" label="Email (Optional)" type="email" placeholder="your@email.com" />
      <div className="grid grid-cols-2 gap-3">
        <Input name="event_date" label="Event Date" type="date" defaultValue={defaultDate ?? ""} />
        <Input name="guest_count" label="Guest Count" type="number" placeholder="e.g. 300" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          name="slot_preference"
          label="Time Slot"
          options={SLOT_TYPES.map((s) => ({ value: s.value, label: s.label }))}
          placeholder="Any"
        />
        <Select
          name="budget_range"
          label="Budget"
          options={BUDGET_RANGES.map((b) => ({ value: b.value, label: b.label }))}
          placeholder="Any"
        />
      </div>
      <Input name="message" label="Additional Requirements" placeholder="Any special requirements..." />
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {formError}
        </div>
      )}
      <Button type="submit" className="w-full" loading={loading}>
        {loading ? "Submitting..." : "Send Enquiry"}
      </Button>
      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to be contacted by VivahSthal and the venue.
      </p>
    </form>
  );
}

export function LeadForm({
  venueId,
  venueName,
  trigger = "contact",
  defaultDate,
  onClose,
  inline = false,
}: LeadFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ── Inline mode: render form directly, no overlay ──
  if (inline) {
    return (
      <EnquiryForm
        venueId={venueId}
        venueName={venueName}
        trigger={trigger}
        defaultDate={defaultDate}
        onDone={() => {}}
        onClose={onClose}
      />
    );
  }

  // ── Modal mode: trigger button + full-screen overlay ──
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={trigger === "contact" ? "default" : "accent"}
        className="w-full"
      >
        <Phone className="h-4 w-4" />
        {trigger === "contact" ? "View Contact" : "Check Availability"}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-gold p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">
                    {trigger === "contact" ? "Get Venue Contact" : "Check Availability"}
                  </h3>
                  {venueName && <p className="text-white/70 text-sm mt-0.5">{venueName}</p>}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="p-6">
                <EnquiryForm
                  venueId={venueId}
                  venueName={venueName}
                  trigger={trigger}
                  defaultDate={defaultDate}
                  onDone={() => setIsOpen(false)}
                  onClose={onClose}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
