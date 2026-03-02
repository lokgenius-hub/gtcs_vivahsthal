"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Building2, Pencil, X, MapPin, Users,
  IndianRupee, Eye, CheckCircle2, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import ImageUploader from "@/components/venue/image-uploader";
import { createVenue, updateVenue, getMyVenues } from "@/lib/actions";
import { CITIES, VENUE_TYPES, AMENITIES } from "@/lib/constants";
import type { Venue } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

// ── Shared venue form used for both create and edit ─────────
function VenueForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Venue;
  onSubmit: (fd: FormData, images: string[], amenities: string[]) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await onSubmit(fd, images, amenities);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="name"
          label="Venue Name"
          placeholder="e.g. Royal Palace Banquet"
          defaultValue={initial?.name}
          required
        />
        <Select
          name="venue_type"
          label="Venue Type"
          options={VENUE_TYPES.map((v) => ({ value: v.value, label: v.label }))}
          placeholder="Select type"
          defaultValue={initial?.venue_type}
        />
        <Select
          name="city"
          label="City"
          options={CITIES.map((c) => ({ value: c, label: c }))}
          placeholder="Select city"
          defaultValue={initial?.city}
        />
        <Input name="state" label="State" defaultValue={initial?.state ?? "Bihar"} />
        <Input
          name="address"
          label="Address"
          placeholder="Full address"
          className="sm:col-span-2"
          defaultValue={initial?.address}
          required
        />
        <Input name="pincode" label="Pincode" placeholder="e.g. 821101" defaultValue={initial?.pincode ?? ""} />
        <Input name="capacity_min" label="Min Capacity" type="number" placeholder="50" defaultValue={initial?.capacity_min?.toString()} />
        <Input name="capacity_max" label="Max Capacity" type="number" placeholder="500" defaultValue={initial?.capacity_max?.toString()} />
        <Input
          name="price_per_slot"
          label="Price per Slot (Rs)"
          type="number"
          placeholder="250000"
          defaultValue={initial?.price_per_slot?.toString()}
          required
        />
        <Input
          name="price_per_plate"
          label="Price per Plate (Rs)"
          type="number"
          placeholder="800"
          defaultValue={initial?.price_per_plate?.toString() ?? ""}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          placeholder="Describe your venue..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() =>
                setAmenities((prev) =>
                  prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
                )
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                amenities.includes(a)
                  ? "bg-gradient-gold text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <ImageUploader
        initialImages={initial?.images ?? []}
        onChange={setImages}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function VenueCard({ venue, onUpdated }: { venue: Venue; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const handleUpdate = async (fd: FormData, images: string[], amenities: string[]) => {
    fd.set("amenities", JSON.stringify(amenities));
    fd.set("images", JSON.stringify(images));
    if (images.length > 0) fd.set("cover_image", images[0]);
    const result = await updateVenue(venue.id, fd);
    if (!result.success) throw new Error(result.error ?? "Update failed");
    setSaveOk(true);
    setEditing(false);
    onUpdated();
    setTimeout(() => setSaveOk(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          {venue.cover_image ? (
            <img src={venue.cover_image} alt={venue.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <Building2 className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800 truncate">{venue.name}</h3>
            {venue.is_active ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">Active</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> Pending review
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{venue.city}, {venue.state}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{venue.capacity_min}-{venue.capacity_max} guests</span>
            <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{formatPrice(venue.price_per_slot)} / slot</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <a href={`/venues/${venue.slug}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline">
              <Eye className="h-3 w-3" /> Public view
            </a>
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 text-xs font-medium text-gray-600 transition-colors"
        >
          {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {saveOk && (
        <div className="mx-5 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Venue updated successfully!
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-5 bg-gray-50/50">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Edit Venue — <span className="text-gray-400 font-normal">partner can update name, images, pricing, amenities</span>
              </p>
              <VenueForm
                initial={venue}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(false)}
                submitLabel="Save Changes"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchVenues = useCallback(async () => {
    setLoadingVenues(true);
    const { venues: data } = await getMyVenues();
    setVenues(data as Venue[]);
    setLoadingVenues(false);
  }, []);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const handleCreate = async (fd: FormData, images: string[], amenities: string[]) => {
    fd.set("amenities", JSON.stringify(amenities));
    fd.set("images", JSON.stringify(images));
    if (images.length > 0) fd.set("cover_image", images[0]);
    const result = await createVenue(fd);
    if (!result.success) throw new Error(result.error ?? "Could not create venue");
    setCreateSuccess(true);
    setShowCreate(false);
    fetchVenues();
    setTimeout(() => setCreateSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">My Venues</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loadingVenues ? "Loading..." : venues.length > 0
              ? `${venues.length} venue${venues.length > 1 ? "s" : ""} listed`
              : "Add your first venue to start getting bookings"}
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" /> Add Venue
        </Button>
      </div>

      {createSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Venue submitted! It will go live after admin review.
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">Add New Venue</h2>
            <VenueForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
              submitLabel="Create Venue"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {loadingVenues ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : venues.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No venues yet</p>
          <p className="text-sm text-gray-400 mt-1">Click <strong>Add Venue</strong> above to create your first listing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map((v) => <VenueCard key={v.id} venue={v} onUpdated={fetchVenues} />)}
        </div>
      )}
    </div>
  );
}
